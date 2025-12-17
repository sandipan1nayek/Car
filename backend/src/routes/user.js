const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  res.json({ message: 'Profile update endpoint - to be implemented' });
});

// Get wallet balance
router.get('/wallet', auth, async (req, res) => {
  res.json({ balance: req.user.wallet_balance });
});

// Add money to wallet
router.post('/wallet/add', auth, async (req, res) => {
  res.json({ message: 'Wallet add money endpoint - to be implemented' });
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  res.json({ message: 'Transactions endpoint - to be implemented' });
});

module.exports = router;
