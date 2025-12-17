const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Base role - everyone is a customer
  role_base: {
    type: String,
    default: 'customer',
    enum: ['customer']
  },
  
  // Role flags (additive privileges)
  is_driver: {
    type: Boolean,
    default: false
  },
  is_manager: {
    type: Boolean,
    default: false
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  
  // Driver-specific fields
  driver_application_status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', null],
    default: null
  },
  driver_status: {
    type: String,
    enum: ['online', 'offline', 'on_ride'],
    default: 'offline'
  },
  is_dummy: {
    type: Boolean,
    default: false
  },
  driver_documents: {
    license: String,
    vehicleRegistration: String,
    insurance: String
  },
  vehicle_info: {
    make: String,
    model: String,
    year: Number,
    plate: String,
    color: String
  },
  driver_rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  total_rides_completed: {
    type: Number,
    default: 0
  },
  
  // Wallet
  wallet_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Account status
  is_suspended: {
    type: Boolean,
    default: false
  },
  
  // Email preferences
  email_preferences: {
    ride_receipts: { type: Boolean, default: true },
    promotional: { type: Boolean, default: true },
    weekly_summary: { type: Boolean, default: true },
    critical_alerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (hide sensitive data)
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
