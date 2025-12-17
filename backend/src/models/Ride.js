const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['requested', 'assigned', 'en_route', 'completed', 'cancelled'],
    default: 'requested'
  },
  
  // Pickup location
  pickup: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // Dropoff location
  dropoff: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  // Distance and duration
  distance_km: {
    type: Number,
    required: true
  },
  estimated_duration_min: {
    type: Number,
    required: true
  },
  
  // Fare
  fare_estimated: {
    type: Number,
    required: true
  },
  fare_final: {
    type: Number,
    default: null
  },
  
  // Vehicle type and scheduling
  vehicle_type: {
    type: String,
    enum: ['bike', 'car', 'shuttle', 'special'],
    default: 'car'
  },
  scheduled_time: {
    type: Date,
    default: null
  },
  
  // Timestamps
  requested_at: {
    type: Date,
    default: Date.now
  },
  accepted_at: {
    type: Date,
    default: null
  },
  pickup_time: {
    type: Date,
    default: null
  },
  started_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  
  // Ratings
  customer_rating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  driver_rating: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  
  // Cancellation
  cancelled_by: {
    type: String,
    enum: ['customer', 'driver', 'system', null],
    default: null
  },
  cancellation_reason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
rideSchema.index({ customer: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
