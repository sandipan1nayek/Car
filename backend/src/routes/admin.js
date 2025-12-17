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
  getAnalytics,
  getPendingDrivers
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

// New driver approval routes
router.get('/drivers/pending', auth, requireAdmin, getPendingDrivers);
router.post('/drivers/:userId/approve', auth, requireAdmin, async (req, res) => {
  console.log('🎯 INLINE ROUTE HANDLER');
  console.log('req.params:', req.params);
  console.log('req.params.userId:', req.params.userId);
  
  try {
    const User = require('../models/User');
    const { userId } = req.params;
    console.log('Looking for userId:', userId);
    
    const user = await User.findById(userId);
    console.log('User result:', user ? user.name : 'NULL');
    
    if (!user) {
      console.log('Sending 404');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.driver_application_status !== 'pending') {
      return res.status(400).json({ error: 'No pending application' });
    }
    
    user.is_driver = true;
    user.driver_application_status = 'approved';
    user.driver_status = 'offline';
    await user.save();
    
    console.log('✅ Driver approved successfully');
    res.json({ message: 'Driver approved successfully', user: { id: user._id, name: user.name } });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.post('/drivers/:userId/reject', auth, requireAdmin, rejectDriver);

module.exports = router;
