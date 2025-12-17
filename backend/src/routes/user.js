const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getWallet,
  addMoney,
  getTransactions
} = require('../controllers/userController');

// Get user profile
router.get('/profile', auth, getProfile);

// Update profile
router.put('/profile', auth, updateProfile);

// Upload profile picture
router.post('/profile/picture', auth, uploadProfilePicture);

// Get wallet balance
router.get('/wallet', auth, getWallet);

// Add money to wallet
router.post('/wallet/add', auth, addMoney);

// Get transaction history
router.get('/transactions', auth, getTransactions);

module.exports = router;
