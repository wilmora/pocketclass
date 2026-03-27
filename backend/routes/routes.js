const express = require('express');
const Route = require('../models/Route');
const RideBooking = require('../models/RideBooking');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      day,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      maxDistance = 5000,
      minSeats = 1
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {
      isActive: true,
      status: 'active',
      availableSeats: { $gte: parseInt(minSeats) }
    };

    // Filter by day if provided
    if (day) {
      query['schedule.daysOfWeek'] = day.toLowerCase();
    }

    let routes;

    // If coordinates are provided, find nearby routes
    if (pickupLat && pickupLng) {
      const coordinates = [parseFloat(pickupLng), parseFloat(pickupLat)];
      
      routes = await Route.find({
        ...query,
        $or: [
          {
            'pickupLocation.coordinates': {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: coordinates
                },
                $maxDistance: parseInt(maxDistance)
              }
            }
          },
          {
            'dropoffLocation.coordinates': {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: coordinates
                },
                $maxDistance: parseInt(maxDistance)
              }
            }
          }
        ]
      })
      .populate('driver', 'name profileImage rating driverDetails.rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    } else {
      routes = await Route.find(query)
        .populate('driver', 'name profileImage rating driverDetails.rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await Route.countDocuments(query);

    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: routes
    });

  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get routes',
      message: error.message
    });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
// @access  Public
const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('driver', 'name profileImage phone rating driverDetails');

    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found',
        message: 'No route found with this ID'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get route',
      message: error.message
    });
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Drivers only)
const createRoute = async (req, res) => {
  try {
    // Add driver ID to the request body
    req.body.driver = req.user.id;

    const route = await Route.create(req.body);

    // Populate driver info
    await route.populate('driver', 'name profileImage rating');

    res.status(201).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create route',
      message: error.message
    });
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private (Route owner only)
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('driver', 'name profileImage rating');

    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update route',
      message: error.message
    });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private (Route owner only)
const deleteRoute = async (req, res) => {
  try {
    // Check if there are active bookings for this route
    const activeBookings = await RideBooking.countDocuments({
      route: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete route',
        message: 'Cannot delete route with active bookings'
      });
    }

    await Route.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });

  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete route',
      message: error.message
    });
  }
};

// @desc    Get driver's routes
// @route   GET /api/routes/driver/:driverId
// @access  Private
const getDriverRoutes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all'
    } = req.query;

    const skip = (page - 1) * limit;

    let query = { driver: req.params.driverId };

    if (status !== 'all') {
      query.status = status;
    }

    const routes = await Route.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Route.countDocuments(query);

    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: routes
    });

  } catch (error) {
    console.error('Get driver routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get driver routes',
      message: error.message
    });
  }
};

// @desc    Toggle route status (active/inactive)
// @route   PATCH /api/routes/:id/toggle-status
// @access  Private (Route owner only)
const toggleRouteStatus = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    }

    route.isActive = !route.isActive;
    route.status = route.isActive ? 'active' : 'inactive';
    
    await route.save();

    res.status(200).json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error('Toggle route status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle route status',
      message: error.message
    });
  }
};

// @desc    Get route bookings
// @route   GET /api/routes/:id/bookings
// @access  Private (Route owner only)
const getRouteBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'all'
    } = req.query;

    const skip = (page - 1) * limit;

    let query = { route: req.params.id };

    if (status !== 'all') {
      query.status = status;
    }

    const bookings = await RideBooking.find(query)
      .populate('rider', 'name profileImage phone rating')
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
    console.error('Get route bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get route bookings',
      message: error.message
    });
  }
};

// @desc    Search routes
// @route   GET /api/routes/search
// @access  Public
const searchRoutes = async (req, res) => {
  try {
    const {
      from,
      to,
      day,
      maxDistance = 5000,
      minSeats = 1,
      page = 1,
      limit = 10
    } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Both from and to locations are required'
      });
    }

    const skip = (page - 1) * limit;

    // This is a simplified search - in production you'd use proper geocoding
    let query = {
      isActive: true,
      status: 'active',
      availableSeats: { $gte: parseInt(minSeats) },
      $or: [
        {
          'pickupLocation.name': { $regex: from, $options: 'i' }
        },
        {
          'pickupLocation.address': { $regex: from, $options: 'i' }
        }
      ],
      $and: [
        {
          $or: [
            {
              'dropoffLocation.name': { $regex: to, $options: 'i' }
            },
            {
              'dropoffLocation.address': { $regex: to, $options: 'i' }
            }
          ]
        }
      ]
    };

    if (day) {
      query['schedule.daysOfWeek'] = day.toLowerCase();
    }

    const routes = await Route.find(query)
      .populate('driver', 'name profileImage rating driverDetails.rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Route.countDocuments(query);

    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: routes
    });

  } catch (error) {
    console.error('Search routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search routes',
      message: error.message
    });
  }
};

// @desc    Get routes by day
// @route   GET /api/routes/by-day/:day
// @access  Public
const getRoutesByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const routes = await Route.find({
      'schedule.daysOfWeek': day.toLowerCase(),
      isActive: true,
      status: 'active',
      availableSeats: { $gt: 0 }
    })
    .populate('driver', 'name profileImage rating driverDetails.rating')
    .sort({ 'schedule.departureTime': 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Route.countDocuments({
      'schedule.daysOfWeek': day.toLowerCase(),
      isActive: true,
      status: 'active',
      availableSeats: { $gt: 0 }
    });

    res.status(200).json({
      success: true,
      count: routes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: routes
    });

  } catch (error) {
    console.error('Get routes by day error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get routes by day',
      message: error.message
    });
  }
};

// Routes
router.get('/', getRoutes);
router.get('/search', searchRoutes);
router.get('/by-day/:day', getRoutesByDay);
router.get('/driver/:driverId', protect, getDriverRoutes);
router.post('/', protect, authorize('driver'), createRoute);
router.get('/:id', getRoute);
router.put('/:id', protect, authorize('driver'), checkOwnership(Route, 'id'), updateRoute);
router.delete('/:id', protect, authorize('driver'), checkOwnership(Route, 'id'), deleteRoute);
router.patch('/:id/toggle-status', protect, authorize('driver'), checkOwnership(Route, 'id'), toggleRouteStatus);
router.get('/:id/bookings', protect, authorize('driver'), checkOwnership(Route, 'id'), getRouteBookings);

module.exports = router;