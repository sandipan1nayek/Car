const mongoose = require('mongoose');

const driverLocationSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  is_online: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically deleted after 5 minutes
  }
}, {
  timestamps: true
});

// Geospatial index for finding nearby drivers
driverLocationSchema.index({ location: '2dsphere' });
driverLocationSchema.index({ driver: 1 });
driverLocationSchema.index({ is_online: 1 });

module.exports = mongoose.model('DriverLocation', driverLocationSchema);
