const express = require('express');
const router = express.Router();
const { auth, requireDriver } = require('../middleware/auth');
const {
  applyDriver,
  getApplication,
  goOnline,
  goOffline,
  updateLocation,
  acceptRide,
  rejectRide,
  startTrip,
  completeTrip,
  getEarnings,
  getActiveRide
} = require('../controllers/driverController');

// Apply to become driver
router.post('/apply', auth, applyDriver);

// Get application status
router.get('/application', auth, getApplication);

// Go online (requires driver role)
router.post('/online', auth, requireDriver, goOnline);

// Go offline
router.post('/offline', auth, requireDriver, goOffline);

// Update location
router.post('/location', auth, requireDriver, updateLocation);

// Accept ride
router.post('/rides/:id/accept', auth, requireDriver, acceptRide);

// Reject ride
router.post('/rides/:id/reject', auth, requireDriver, rejectRide);

// Start trip
router.post('/rides/:id/start', auth, requireDriver, startTrip);

// Complete trip
router.post('/rides/:id/complete', auth, requireDriver, completeTrip);

// Get earnings
router.get('/earnings', auth, requireDriver, getEarnings);

// Get active ride
router.get('/rides/active', auth, requireDriver, getActiveRide);

module.exports = router;
