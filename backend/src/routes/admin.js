const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth');
const {
  getDashboard,
  getDriverApplications,
  getApplicationDetails,
  approveDriver,
  rejectDriver,
  getUsers,
  suspendUser,
  unsuspendUser,
  createManager,
  removeManager,
  getAnalytics
} = require('../controllers/adminController');

// Get dashboard stats
router.get('/dashboard', auth, requireAdmin, getDashboard);

// Get driver applications
router.get('/applications', auth, requireAdmin, getDriverApplications);

// Get application details
router.get('/applications/:id', auth, requireAdmin, getApplicationDetails);

// Approve driver
router.post('/applications/:id/approve', auth, requireAdmin, approveDriver);

// Reject driver
router.post('/applications/:id/reject', auth, requireAdmin, rejectDriver);

// Get all users
router.get('/users', auth, requireAdmin, getUsers);

// Suspend user
router.post('/users/:id/suspend', auth, requireAdmin, suspendUser);

// Unsuspend user
router.post('/users/:id/unsuspend', auth, requireAdmin, unsuspendUser);

// Create manager
router.post('/managers/create', auth, requireAdmin, createManager);

// Remove manager
router.delete('/managers/:id', auth, requireAdmin, removeManager);

// Get analytics
router.get('/analytics', auth, requireAdmin, getAnalytics);

module.exports = router;
