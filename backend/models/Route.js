const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required']
  },
  
  // Route details
  title: {
    type: String,
    required: [true, 'Route title is required'],
    trim: true,
    maxlength: [100, 'Route title must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },

  // Location details
  pickupLocation: {
    name: {
      type: String,
      required: [true, 'Pickup location name is required']
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Pickup coordinates are required'],
      index: '2dsphere'
    }
  },
  
  dropoffLocation: {
    name: {
      type: String,
      required: [true, 'Dropoff location name is required']
    },
    address: {
      type: String,
      required: [true, 'Dropoff address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Dropoff coordinates are required'],
      index: '2dsphere'
    }
  },

  // Route path (for displaying on map)
  routePath: [{
    latitude: Number,
    longitude: Number
  }],

  // Scheduling
  schedule: {
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    }],
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'custom'],
      default: 'weekly'
    }
  },

  // Capacity and pricing
  maxPassengers: {
    type: Number,
    required: [true, 'Maximum passengers is required'],
    min: [1, 'At least 1 passenger is required'],
    max: [6, 'Maximum 6 passengers allowed']
  },
  availableSeats: {
    type: Number,
    required: true
  },
  fare: {
    type: Number,
    default: 8.00,
    min: [0, 'Fare cannot be negative']
  },

  // Route status
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed', 'cancelled'],
    default: 'active'
  },

  // Route preferences
  preferences: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    musicPreference: {
      type: String,
      enum: ['no-music', 'driver-choice', 'passenger-choice', 'no-preference'],
      default: 'no-preference'
    },
    conversationLevel: {
      type: String,
      enum: ['chatty', 'quiet', 'no-preference'],
      default: 'no-preference'
    },
    luggageSpace: {
      type: String,
      enum: ['none', 'small-bag', 'medium-bag', 'large-bag'],
      default: 'small-bag'
    }
  },

  // Statistics
  totalBookings: {
    type: Number,
    default: 0
  },
  completedRides: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  // Special dates (holidays, one-time rides)
  specialDates: [{
    date: Date,
    isAvailable: Boolean,
    note: String
  }],

  // Route notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters']
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
routeSchema.index({ driver: 1 });
routeSchema.index({ status: 1, isActive: 1 });
routeSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
routeSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });
routeSchema.index({ 'schedule.daysOfWeek': 1 });
routeSchema.index({ createdAt: -1 });

// Virtual for distance calculation
routeSchema.virtual('distance').get(function() {
  if (!this.pickupLocation.coordinates || !this.dropoffLocation.coordinates) return null;
  
  const [lon1, lat1] = this.pickupLocation.coordinates;
  const [lon2, lat2] = this.dropoffLocation.coordinates;
  
  // Haversine formula to calculate distance
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
});

// Virtual for estimated duration (rough estimate based on distance)
routeSchema.virtual('estimatedDuration').get(function() {
  const distance = this.distance;
  if (!distance) return null;
  
  // Assume average speed of 40 km/h in city
  const duration = (distance / 40) * 60; // Convert to minutes
  return Math.round(duration);
});

// Pre-save middleware to set available seats
routeSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('maxPassengers')) {
    this.availableSeats = this.maxPassengers;
  }
  next();
});

// Static method to find routes near a location
routeSchema.statics.findNearby = function(coordinates, maxDistance = 5000, day = null) {
  const query = {
    $or: [
      {
        'pickupLocation.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: maxDistance
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
            $maxDistance: maxDistance
          }
        }
      }
    ],
    isActive: true,
    status: 'active',
    availableSeats: { $gt: 0 }
  };

  if (day) {
    query['schedule.daysOfWeek'] = day.toLowerCase();
  }

  return this.find(query).populate('driver', 'name profileImage rating');
};

// Static method to find routes by day
routeSchema.statics.findByDay = function(day) {
  return this.find({
    'schedule.daysOfWeek': day.toLowerCase(),
    isActive: true,
    status: 'active',
    availableSeats: { $gt: 0 }
  }).populate('driver', 'name profileImage rating');
};

// Instance method to check availability
routeSchema.methods.isAvailableForBooking = function() {
  return this.isActive && 
         this.status === 'active' && 
         this.availableSeats > 0;
};

// Instance method to book a seat
routeSchema.methods.bookSeat = function() {
  if (this.availableSeats > 0) {
    this.availableSeats -= 1;
    this.totalBookings += 1;
    return this.save();
  }
  throw new Error('No available seats');
};

// Instance method to cancel a booking
routeSchema.methods.cancelBooking = function() {
  this.availableSeats += 1;
  this.totalBookings -= 1;
  return this.save();
};

module.exports = mongoose.model('Route', routeSchema);