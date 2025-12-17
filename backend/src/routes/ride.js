const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createRide,
  getFareEstimate,
  cancelRide,
  getRide,
  rateRide,
  getRideHistory
} = require('../controllers/rideController');

// Create ride request
router.post('/create', auth, createRide);

// Get fare estimate
router.get('/fare-estimate', auth, getFareEstimate);

// Get ride history (must be before /:id route)
router.get('/history', auth, getRideHistory);

// Cancel ride
router.post('/:id/cancel', auth, cancelRide);

// Get ride details
router.get('/:id', auth, getRide);

// Rate ride
router.post('/:id/rate', auth, rateRide);

module.exports = router;
