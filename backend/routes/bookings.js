const express = require('express');
const RideBooking = require('../models/RideBooking');
const Route = require('../models/Route');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Riders only)
const createBooking = async (req, res) => {
  try {
    const { routeId, rideDate, numberOfPassengers = 1, specialRequests } = req.body;

    // Check if route exists and is available
    const route = await Route.findById(routeId).populate('driver');
    
    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found',
        message: 'The requested route does not exist'
      });
    }

    if (!route.isAvailableForBooking()) {
      return res.status(400).json({
        success: false,
        error: 'Route not available',
        message: 'This route is not currently available for booking'
      });
    }

    if (route.availableSeats < numberOfPassengers) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient seats',
        message: `Only ${route.availableSeats} seats available`
      });
    }

    // Check if rider already has a booking for this route on the same date
    const existingBooking = await RideBooking.findOne({
      rider: req.user.id,
      route: routeId,
      rideDate: new Date(rideDate),
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        error: 'Booking already exists',
        message: 'You already have a booking for this route on this date'
      });
    }

    // Create booking
    const bookingData = {
      rider: req.user.id,
      driver: route.driver._id,
      route: routeId,
      rideDate: new Date(rideDate),
      numberOfPassengers,
      pickupLocation: route.pickupLocation,
      dropoffLocation: route.dropoffLocation,
      payment: {
        amount: 8.00 * numberOfPassengers,
        method: req.body.paymentMethod || 'card'
      }
    };

    if (specialRequests) {
      bookingData.specialRequests = specialRequests;
    }

    const booking = await RideBooking.create(bookingData);

    // Update route availability
    route.availableSeats -= numberOfPassengers;
    route.totalBookings += 1;
    await route.save();

    // Populate booking data
    await booking.populate([
      { path: 'rider', select: 'name profileImage phone' },
      { path: 'driver', select: 'name profileImage phone' },
      { path: 'route', select: 'title pickupLocation dropoffLocation schedule' }
    ]);

    res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message
    });
  }
};

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all',
      upcoming = false
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {};

    // Set query based on user type
    if (req.user.userType === 'driver') {
      query.driver = req.user.id;
    } else {
      query.rider = req.user.id;
    }

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Filter upcoming rides only
    if (upcoming === 'true') {
      query.rideDate = { $gte: new Date() };
    }

    const bookings = await RideBooking.find(query)
      .populate('rider', 'name profileImage phone rating')
      .populate('driver', 'name profileImage phone rating')
      .populate('route', 'title pickupLocation dropoffLocation schedule')
      .sort({ rideDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RideBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: bookings
    });

  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get bookings',
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private (Booking participants only)
const getBooking = async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.id)
      .populate('rider', 'name profileImage phone rating riderDetails')
      .populate('driver', 'name profileImage phone rating driverDetails')
      .populate('route', 'title pickupLocation dropoffLocation schedule preferences');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found',
        message: 'No booking found with this ID'
      });
    }

    // Check if user is participant in this booking
    if (booking.rider._id.toString() !== req.user.id && 
        booking.driver._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get booking',
      message: error.message
    });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Driver only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['confirmed', 'cancelled', 'in-progress', 'completed', 'no-show'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Please provide a valid booking status'
      });
    }

    const booking = await RideBooking.findById(req.params.id)
      .populate('route');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only driver can update status
    if (booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Only the driver can update booking status'
      });
    }

    const oldStatus = booking.status;
    booking.status = status;

    // Handle status-specific logic
    if (status === 'completed') {
      booking.tracking.actualDropoffTime = new Date();
      booking.payment.status = 'completed';
      booking.payment.paidAt = new Date();
    }

    if (status === 'cancelled' || status === 'no-show') {
      // Return seats to route
      const route = await Route.findById(booking.route._id);
      if (route) {
        route.availableSeats += booking.numberOfPassengers;
        route.totalBookings -= 1;
        await route.save();
      }

      // Set cancellation info
      booking.cancellation = {
        cancelledBy: req.user.id,
        reason: req.body.reason || (status === 'no-show' ? 'no_show' : 'driver_unavailable'),
        comment: req.body.comment,
        cancelledAt: new Date()
      };
    }

    await booking.save();

    // Populate updated booking
    await booking.populate([
      { path: 'rider', select: 'name profileImage phone' },
      { path: 'driver', select: 'name profileImage phone' },
      { path: 'route', select: 'title pickupLocation dropoffLocation' }
    ]);

    res.status(200).json({
      success: true,
      data: booking,
      message: `Booking ${status} successfully`
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private (Booking participants only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.id)
      .populate('route');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user can cancel this booking
    if (booking.rider.toString() !== req.user.id && 
        booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel booking',
        message: 'This booking cannot be cancelled at this time'
      });
    }

    // Return seats to route
    const route = await Route.findById(booking.route._id);
    if (route) {
      route.availableSeats += booking.numberOfPassengers;
      route.totalBookings -= 1;
      await route.save();
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: req.user.id,
      reason: req.body.reason || 'rider_request',
      comment: req.body.comment,
      cancelledAt: new Date()
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking',
      message: error.message
    });
  }
};

// @desc    Add rating and review
// @route   POST /api/bookings/:id/rate
// @access  Private (Booking participants only)
const rateBooking = async (req, res) => {
  try {
    const { score, comment } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    const booking = await RideBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot rate booking',
        message: 'You can only rate completed bookings'
      });
    }

    // Determine if user is rider or driver and update accordingly
    if (booking.rider.toString() === req.user.id) {
      // Rider rating driver
      if (booking.rating.riderToDriver.score) {
        return res.status(400).json({
          success: false,
          error: 'Already rated',
          message: 'You have already rated this driver'
        });
      }

      booking.rating.riderToDriver = {
        score,
        comment,
        ratedAt: new Date()
      };

    } else if (booking.driver.toString() === req.user.id) {
      // Driver rating rider
      if (booking.rating.driverToRider.score) {
        return res.status(400).json({
          success: false,
          error: 'Already rated',
          message: 'You have already rated this rider'
        });
      }

      booking.rating.driverToRider = {
        score,
        comment,
        ratedAt: new Date()
      };

    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to rate this booking'
      });
    }

    await booking.save();

    // Update user's overall rating
    const targetUserId = req.user.id === booking.rider.toString() 
      ? booking.driver 
      : booking.rider;
    
    await updateUserRating(targetUserId, req.user.userType === 'rider' ? 'driver' : 'rider');

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: booking.rating
    });

  } catch (error) {
    console.error('Rate booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add rating',
      message: error.message
    });
  }
};

// @desc    Send message in booking
// @route   POST /api/bookings/:id/messages
// @access  Private (Booking participants only)
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const booking = await RideBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is participant
    if (booking.rider.toString() !== req.user.id && 
        booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to send messages in this booking'
      });
    }

    await booking.addMessage(req.user.id, message.trim());

    await booking.populate([
      { path: 'messages.sender', select: 'name profileImage' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: booking.messages[booking.messages.length - 1]
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
};

// @desc    Get booking messages
// @route   GET /api/bookings/:id/messages
// @access  Private (Booking participants only)
const getMessages = async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.id)
      .populate('messages.sender', 'name profileImage')
      .select('messages rider driver');

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user is participant
    if (booking.rider.toString() !== req.user.id && 
        booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Mark messages as read
    await booking.markMessagesAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: booking.messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages',
      message: error.message
    });
  }
};

// Helper function to update user rating
const updateUserRating = async (userId, userType) => {
  try {
    const completedBookings = await RideBooking.find({
      [userType === 'driver' ? 'driver' : 'rider']: userId,
      status: 'completed'
    });

    const ratings = completedBookings
      .map(booking => userType === 'driver' 
        ? booking.rating.riderToDriver.score 
        : booking.rating.driverToRider.score)
      .filter(score => score > 0);

    if (ratings.length > 0) {
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      
      const updateField = userType === 'driver' 
        ? { 'driverDetails.rating': Math.round(averageRating * 10) / 10 }
        : { 'riderDetails.rating': Math.round(averageRating * 10) / 10 };

      await User.findByIdAndUpdate(userId, updateField);
    }
  } catch (error) {
    console.error('Update user rating error:', error);
  }
};

// Routes
router.post('/', protect, authorize('rider'), createBooking);
router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.patch('/:id/status', protect, authorize('driver'), updateBookingStatus);
router.delete('/:id', protect, cancelBooking);
router.post('/:id/rate', protect, rateBooking);
router.post('/:id/messages', protect, sendMessage);
router.get('/:id/messages', protect, getMessages);

module.exports = router;