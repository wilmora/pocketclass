const express = require('express');
const User = require('../models/User');
const RideBooking = require('../models/RideBooking');
const Route = require('../models/Route');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (admin only - for future use)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users',
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Own profile only)
const updateUser = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      location: req.body.location
    };

    // Update role-specific details
    if (req.user.userType === 'driver' && req.body.driverDetails) {
      fieldsToUpdate.driverDetails = {
        ...req.user.driverDetails,
        ...req.body.driverDetails
      };
    }

    if (req.user.userType === 'rider' && req.body.riderDetails) {
      fieldsToUpdate.riderDetails = {
        ...req.user.riderDetails,
        ...req.body.riderDetails
      };
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Own profile only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate account',
      message: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (Own profile only)
const getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let stats = {
      totalRides: 0,
      rating: 0,
      earnings: 0,
      memberSince: user.createdAt
    };

    if (user.userType === 'driver') {
      // Driver statistics
      const driverBookings = await RideBooking.find({ 
        driver: userId, 
        status: 'completed' 
      });

      const driverRoutes = await Route.find({ driver: userId });

      stats = {
        ...stats,
        totalRides: driverBookings.length,
        rating: user.driverDetails?.rating || 5.0,
        earnings: user.driverDetails?.earnings || 0,
        totalRoutes: driverRoutes.length,
        activeRoutes: driverRoutes.filter(route => route.isActive).length,
        totalPassengers: driverBookings.reduce((sum, booking) => sum + booking.numberOfPassengers, 0)
      };

    } else if (user.userType === 'rider') {
      // Rider statistics
      const riderBookings = await RideBooking.find({ 
        rider: userId, 
        status: 'completed' 
      });

      const totalSpent = riderBookings.reduce((sum, booking) => sum + booking.payment.amount, 0);

      stats = {
        ...stats,
        totalRides: riderBookings.length,
        rating: user.riderDetails?.rating || 5.0,
        totalSpent,
        averageRideAmount: riderBookings.length ? totalSpent / riderBookings.length : 0
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
};

// @desc    Get user's ride history
// @route   GET /api/users/:id/rides
// @access  Private (Own profile only)
const getUserRides = async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    let rides;
    let total;

    if (user.userType === 'driver') {
      rides = await RideBooking.find({ driver: userId })
        .populate('rider', 'name profileImage rating')
        .populate('route', 'title pickupLocation dropoffLocation')
        .sort({ rideDate: -1 })
        .skip(skip)
        .limit(limit);

      total = await RideBooking.countDocuments({ driver: userId });

    } else {
      rides = await RideBooking.find({ rider: userId })
        .populate('driver', 'name profileImage rating')
        .populate('route', 'title pickupLocation dropoffLocation')
        .sort({ rideDate: -1 })
        .skip(skip)
        .limit(limit);

      total = await RideBooking.countDocuments({ rider: userId });
    }

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rides
    });

  } catch (error) {
    console.error('Get user rides error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ride history',
      message: error.message
    });
  }
};

// @desc    Update user subscription
// @route   PUT /api/users/:id/subscription
// @access  Private (Own profile only)
const updateSubscription = async (req, res) => {
  try {
    const { type, paymentMethod } = req.body;

    if (!type || !['basic', 'premium'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription type'
      });
    }

    const subscriptionData = {
      type,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentMethod
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscription: subscriptionData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription',
      message: error.message
    });
  }
};

// @desc    Cancel user subscription
// @route   DELETE /api/users/:id/subscription
// @access  Private (Own profile only)
const cancelSubscription = async (req, res) => {
  try {
    const subscriptionData = {
      type: 'basic',
      isActive: false,
      endDate: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscription: subscriptionData },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: user
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message
    });
  }
};

// @desc    Find nearby users (for ride matching)
// @route   GET /api/users/nearby
// @access  Private
const getNearbyUsers = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000, userType } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    const query = {
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true,
      _id: { $ne: req.user._id } // Exclude current user
    };

    if (userType && ['driver', 'rider'].includes(userType)) {
      query.userType = userType;
    }

    const users = await User.find(query)
      .select('name profileImage userType location rating')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find nearby users',
      message: error.message
    });
  }
};

// Routes
router.get('/', protect, getUsers);
router.get('/nearby', protect, getNearbyUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, checkOwnership(User), updateUser);
router.delete('/:id', protect, checkOwnership(User), deleteUser);
router.get('/:id/stats', protect, checkOwnership(User), getUserStats);
router.get('/:id/rides', protect, checkOwnership(User), getUserRides);
router.put('/:id/subscription', protect, checkOwnership(User), updateSubscription);
router.delete('/:id/subscription', protect, checkOwnership(User), cancelSubscription);

module.exports = router;