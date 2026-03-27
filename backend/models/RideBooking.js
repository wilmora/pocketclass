const mongoose = require('mongoose');

const rideBookingSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Rider is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required']
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },

  // Booking details
  bookingDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  rideDate: {
    type: Date,
    required: [true, 'Ride date is required']
  },
  numberOfPassengers: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 passenger is required'],
    max: [4, 'Maximum 4 passengers per booking']
  },

  // Location details (in case different from route)
  pickupLocation: {
    name: String,
    address: String,
    coordinates: [Number], // [longitude, latitude]
    notes: String
  },
  dropoffLocation: {
    name: String,
    address: String,
    coordinates: [Number], // [longitude, latitude]
    notes: String
  },

  // Booking status
  status: {
    type: String,
    enum: [
      'pending',      // Waiting for driver confirmation
      'confirmed',    // Driver has confirmed
      'in-progress',  // Ride is currently happening
      'completed',    // Ride finished successfully
      'cancelled',    // Cancelled by rider or driver
      'no-show'       // Rider didn't show up
    ],
    default: 'pending'
  },

  // Payment details
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      default: 8.00
    },
    method: {
      type: String,
      enum: ['card', 'cash', 'digital_wallet', 'subscription'],
      default: 'card'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date
  },

  // Ride tracking
  tracking: {
    driverLocation: {
      coordinates: [Number],
      lastUpdated: Date
    },
    estimatedArrival: Date,
    actualPickupTime: Date,
    actualDropoffTime: Date,
    distance: Number, // in kilometers
    duration: Number  // in minutes
  },

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message must be less than 500 characters']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],

  // Special requests
  specialRequests: {
    wheelchairAccess: {
      type: Boolean,
      default: false
    },
    childSeat: {
      type: Boolean,
      default: false
    },
    extraLuggage: {
      type: Boolean,
      default: false
    },
    petTravel: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      maxlength: [500, 'Special request notes must be less than 500 characters']
    }
  },

  // Ratings and feedback
  rating: {
    riderToDriver: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Comment must be less than 500 characters']
      },
      ratedAt: Date
    },
    driverToRider: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: [500, 'Comment must be less than 500 characters']
      },
      ratedAt: Date
    }
  },

  // Cancellation details
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: [
        'rider_request',
        'driver_unavailable', 
        'weather_conditions',
        'vehicle_issues',
        'emergency',
        'no_show',
        'other'
      ]
    },
    comment: String,
    cancelledAt: Date,
    refundAmount: Number
  },

  // Emergency contacts
  emergencyContact: {
    name: String,
    phone: String,
    notified: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  metadata: {
    platform: {
      type: String,
      enum: ['android', 'ios', 'web'],
      default: 'android'
    },
    appVersion: String,
    userAgent: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
rideBookingSchema.index({ rider: 1, rideDate: -1 });
rideBookingSchema.index({ driver: 1, rideDate: -1 });
rideBookingSchema.index({ route: 1 });
rideBookingSchema.index({ status: 1 });
rideBookingSchema.index({ rideDate: 1 });
rideBookingSchema.index({ bookingDate: -1 });
rideBookingSchema.index({ 'payment.status': 1 });

// Virtual for total earnings (including app commission)
rideBookingSchema.virtual('totalEarnings').get(function() {
  return this.payment.amount * this.numberOfPassengers;
});

// Virtual for driver earnings (after app commission)
rideBookingSchema.virtual('driverEarnings').get(function() {
  const commission = 0.15; // 15% app commission
  return this.totalEarnings * (1 - commission);
});

// Virtual for booking age
rideBookingSchema.virtual('bookingAge').get(function() {
  return Math.floor((Date.now() - this.bookingDate) / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware
rideBookingSchema.pre('save', function(next) {
  // Auto-set payment amount based on number of passengers
  if (this.isNew || this.isModified('numberOfPassengers')) {
    this.payment.amount = 8.00 * this.numberOfPassengers;
  }

  // Set paid date when payment is completed
  if (this.isModified('payment.status') && this.payment.status === 'completed' && !this.payment.paidAt) {
    this.payment.paidAt = new Date();
  }

  next();
});

// Static method to get rider's booking history
rideBookingSchema.statics.getRiderHistory = function(riderId, limit = 10) {
  return this.find({ rider: riderId })
    .populate('driver', 'name profileImage rating')
    .populate('route', 'title pickupLocation dropoffLocation')
    .sort({ rideDate: -1 })
    .limit(limit);
};

// Static method to get driver's booking history
rideBookingSchema.statics.getDriverHistory = function(driverId, limit = 10) {
  return this.find({ driver: driverId })
    .populate('rider', 'name profileImage rating')
    .populate('route', 'title pickupLocation dropoffLocation')
    .sort({ rideDate: -1 })
    .limit(limit);
};

// Static method to get active bookings
rideBookingSchema.statics.getActiveBookings = function(userId) {
  return this.find({
    $or: [{ rider: userId }, { driver: userId }],
    status: { $in: ['pending', 'confirmed', 'in-progress'] }
  })
    .populate('rider', 'name phone profileImage')
    .populate('driver', 'name phone profileImage')
    .populate('route', 'title pickupLocation dropoffLocation schedule')
    .sort({ rideDate: 1 });
};

// Static method to get earnings for a driver
rideBookingSchema.statics.getDriverEarnings = function(driverId, startDate, endDate) {
  const matchQuery = {
    driver: driverId,
    status: 'completed',
    'payment.status': 'completed'
  };

  if (startDate || endDate) {
    matchQuery.rideDate = {};
    if (startDate) matchQuery.rideDate.$gte = new Date(startDate);
    if (endDate) matchQuery.rideDate.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$payment.amount' },
        totalRides: { $sum: 1 },
        totalPassengers: { $sum: '$numberOfPassengers' }
      }
    }
  ]);
};

// Instance method to check if booking can be cancelled
rideBookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const rideTime = new Date(this.rideDate);
  const timeDiff = rideTime - now;
  const hoursUntilRide = timeDiff / (1000 * 60 * 60);

  return this.status === 'pending' || 
         (this.status === 'confirmed' && hoursUntilRide > 1);
};

// Instance method to send message
rideBookingSchema.methods.addMessage = function(senderId, messageText) {
  this.messages.push({
    sender: senderId,
    message: messageText,
    sentAt: new Date(),
    isRead: false
  });
  return this.save();
};

// Instance method to mark messages as read
rideBookingSchema.methods.markMessagesAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });
  return this.save();
};

module.exports = mongoose.model('RideBooking', rideBookingSchema);