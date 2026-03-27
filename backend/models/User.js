const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  userType: {
    type: String,
    enum: ['driver', 'rider'],
    required: [true, 'User type is required']
  },
  profileImage: {
    type: String,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Subscription details
  subscription: {
    type: {
      type: String,
      enum: ['basic', 'premium'],
      default: 'basic'
    },
    isActive: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    paymentMethod: String
  },

  // Driver-specific fields
  driverDetails: {
    licenseNumber: String,
    vehicleInfo: {
      make: String,
      model: String,
      year: Number,
      color: String,
      licensePlate: String
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalRides: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  },

  // Rider-specific fields
  riderDetails: {
    emergencyContact: {
      name: String,
      phone: String
    },
    preferences: {
      musicPreference: String,
      temperaturePreference: String,
      conversationLevel: {
        type: String,
        enum: ['chatty', 'quiet', 'no-preference'],
        default: 'no-preference'
      }
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    totalRides: {
      type: Number,
      default: 0
    }
  },

  // Location and preferences
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  
  // Push notification tokens
  fcmTokens: [String],

  // Account verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  phoneVerificationCode: String,
  phoneVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for full name formatting
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Static method to find nearby users
userSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('User', userSchema);