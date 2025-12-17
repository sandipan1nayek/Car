const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createRide,
  getFareEstimate,
  cancelRide,
  getRide,
  startTrip,
  completeTrip,
  rateRide,
  getRideHistory,
  clearHistory
} = require('../controllers/rideController');

// Create ride request
router.post('/create', auth, createRide);

// Get fare estimate
router.get('/fare-estimate', auth, getFareEstimate);

// Get ride history (must be before /:id route)
router.get('/history', auth, getRideHistory);

// Clear ride history
router.delete('/history/clear', auth, clearHistory);

// Cancel ride
router.post('/:id/cancel', auth, cancelRide);

// Start trip (pickup confirmed)
router.post('/:id/start', auth, startTrip);

// Complete trip
router.post('/:id/complete', auth, completeTrip);

// Get ride details
router.get('/:id', auth, getRide);

// Rate ride
router.post('/:id/rate', auth, rateRide);

module.exports = router;
