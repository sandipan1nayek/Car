const express = require('express');
const router = express.Router();
const { auth, requireDriver } = require('../middleware/auth');

// Apply to become driver
router.post('/apply', auth, async (req, res) => {
  res.json({ message: 'Driver application endpoint - to be implemented' });
});

// Get application status
router.get('/application', auth, async (req, res) => {
  res.json({ message: 'Get application endpoint - to be implemented' });
});

// Go online (requires driver role)
router.post('/online', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Go online endpoint - to be implemented' });
});

// Go offline
router.post('/offline', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Go offline endpoint - to be implemented' });
});

// Accept ride
router.post('/rides/:id/accept', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Accept ride endpoint - to be implemented' });
});

// Start trip
router.post('/rides/:id/start', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Start trip endpoint - to be implemented' });
});

// Complete trip
router.post('/rides/:id/complete', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Complete trip endpoint - to be implemented' });
});

// Get earnings
router.get('/earnings', auth, requireDriver, async (req, res) => {
  res.json({ message: 'Earnings endpoint - to be implemented' });
});

module.exports = router;
