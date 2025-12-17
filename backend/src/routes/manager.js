const express = require('express');
const router = express.Router();
const { auth, requireManager } = require('../middleware/auth');
const {
  getDashboard,
  getUsers,
  getAllRides,
  getActiveRides,
  getChatConversations
} = require('../controllers/managerController');

// Get dashboard stats
router.get('/dashboard', auth, requireManager, getDashboard);

// Get all users
router.get('/users', auth, requireManager, getUsers);

// Get all rides
router.get('/rides', auth, requireManager, getAllRides);

// Get active rides
router.get('/rides/active', auth, requireManager, getActiveRides);

// Get chat conversations
router.get('/chats', auth, requireManager, getChatConversations);

module.exports = router;
