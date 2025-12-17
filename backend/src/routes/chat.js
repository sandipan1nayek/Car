const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  res.json({ message: 'Get conversations endpoint - to be implemented' });
});

// Send message
router.post('/send', auth, async (req, res) => {
  res.json({ message: 'Send message endpoint - to be implemented' });
});

module.exports = router;
