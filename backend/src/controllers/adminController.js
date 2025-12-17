const User = require('../models/User');
const Ride = require('../models/Ride');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard with advanced analytics
// @access  Private (Admin only)
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    // Users
    const totalUsers = await User.countDocuments();
    const totalDrivers = await User.countDocuments({ is_driver: true });
    const activeDrivers = await User.countDocuments({ is_driver: true, driver_status: 'online' });
    const pendingApplications = await User.countDocuments({ driver_application_status: 'pending' });
    
    // Rides
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: 'completed' });
    const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
    const activeRides = await Ride.countDocuments({ status: { $in: ['requested', 'assigned', 'en_route'] } });
    
    // Revenue
    const totalRevenue = await Transaction.aggregate([
      {
        $match: {
          type: 'ride_payment',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } }
        }
      }
    ]);
    
    const todayRevenue = await Transaction.aggregate([
      {
        $match: {
          type: 'ride_payment',
          status: 'completed',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $abs: '$amount' } }
        }
      }
    ]);
    
    // Platform earnings (fees)
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 15;
    const platformEarnings = Math.round((totalRevenue[0]?.total || 0) * platformFeePercentage / 100);
    
    res.json({
      users: {
        total: totalUsers,
        drivers: totalDrivers,
        activeDrivers,
        pendingApplications
      },
      rides: {
        total: totalRides,
        completed: completedRides,
        cancelled: cancelledRides,
        active: activeRides,
        completionRate: totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(2) : 0
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0,
        platformEarnings
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/admin/applications
// @desc    Get driver applications
// @access  Private (Admin only)
exports.getDriverApplications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const applications = await User.find({
      driver_application_status: status
    }).select('-password').sort({ updatedAt: -1 });
    
    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/admin/applications/:id
// @desc    Get driver application details
// @access  Private (Admin only)
exports.getApplicationDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's ride history as customer
    const rideHistory = await Ride.find({ customer: user._id })
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      user,
      rideHistory
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/admin/applications/:id/approve
// @desc    Approve driver application
// @access  Private (Admin only)
exports.approveDriver = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.driver_application_status !== 'pending') {
      return res.status(400).json({ error: 'Application is not pending' });
    }
    
    user.is_driver = true;
    user.driver_application_status = 'approved';
    user.driver_status = 'offline';
    user.driver_rating = 5.0;
    await user.save();
    
    // Send approval email
    const template = emailTemplates.driverApproved(user.name);
    await sendEmail({
      to: user.email,
      subject: template.subject,
      html: template.html
    });
    
    res.json({
      message: 'Driver approved successfully',
      user: {
        id: user._id,
        name: user.name,
        is_driver: user.is_driver
      }
    });
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/admin/applications/:id/reject
// @desc    Reject driver application
// @access  Private (Admin only)
exports.rejectDriver = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.driver_application_status !== 'pending') {
      return res.status(400).json({ error: 'Application is not pending' });
    }
    
    user.driver_application_status = 'rejected';
    await user.save();
    
    // Send rejection email
    await sendEmail({
      to: user.email,
      subject: 'Driver Application Update',
      html: `
        <h2>Application Status Update</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for your interest in becoming a driver with us.</p>
        <p>Unfortunately, we are unable to approve your application at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You may reapply after addressing any issues.</p>
        <p>Best regards,<br>Support Team</p>
      `
    });
    
    res.json({ message: 'Application rejected' });
  } catch (error) {
    console.error('Reject driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const { search, role, suspended, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role === 'driver') {
      query.is_driver = true;
    } else if (role === 'manager') {
      query.is_manager = true;
    }
    
    if (suspended === 'true') {
      query.is_suspended = true;
    } else if (suspended === 'false') {
      query.is_suspended = false;
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/admin/users/:id/suspend
// @desc    Suspend a user
// @access  Private (Admin only)
exports.suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_admin) {
      return res.status(400).json({ error: 'Cannot suspend admin users' });
    }
    
    user.is_suspended = true;
    user.suspension_reason = reason || 'Terms violation';
    await user.save();
    
    // Cancel any active rides
    await Ride.updateMany(
      {
        $or: [
          { customer: user._id },
          { driver: user._id }
        ],
        status: { $in: ['requested', 'assigned', 'en_route'] }
      },
      { status: 'cancelled' }
    );
    
    // Send notification email
    await sendEmail({
      to: user.email,
      subject: 'Account Suspended',
      html: `
        <h2>Account Suspension Notice</h2>
        <p>Dear ${user.name},</p>
        <p>Your account has been suspended.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact support if you believe this is a mistake.</p>
      `
    });
    
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/admin/users/:id/unsuspend
// @desc    Unsuspend a user
// @access  Private (Admin only)
exports.unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.is_suspended = false;
    user.suspension_reason = null;
    await user.save();
    
    await sendEmail({
      to: user.email,
      subject: 'Account Reactivated',
      html: `
        <h2>Account Reactivated</h2>
        <p>Dear ${user.name},</p>
        <p>Your account has been reactivated. You can now use our services again.</p>
        <p>Thank you for your patience.</p>
      `
    });
    
    res.json({ message: 'User unsuspended successfully' });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/admin/managers/create
// @desc    Create a manager account
// @access  Private (Admin only)
exports.createManager = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create manager
    const manager = await User.create({
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      role_base: 'customer',
      is_manager: true
    });
    
    await sendEmail({
      to: manager.email,
      subject: 'Manager Account Created',
      html: `
        <h2>Welcome to the Team!</h2>
        <p>Dear ${manager.name},</p>
        <p>A manager account has been created for you.</p>
        <p><strong>Email:</strong> ${manager.email}</p>
        <p>You can now log in to access the manager dashboard.</p>
      `
    });
    
    res.json({
      message: 'Manager created successfully',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email
      }
    });
  } catch (error) {
    console.error('Create manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   DELETE /api/admin/managers/:id
// @desc    Remove manager role
// @access  Private (Admin only)
exports.removeManager = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.is_manager) {
      return res.status(400).json({ error: 'User is not a manager' });
    }
    
    user.is_manager = false;
    await user.save();
    
    res.json({ message: 'Manager role removed' });
  } catch (error) {
    console.error('Remove manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin only)
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Daily rides
    const dailyRides = await Ride.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$fare_final' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top drivers
    const topDrivers = await Ride.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$driver',
          rides: { $sum: 1 },
          earnings: { $sum: '$fare_final' }
        }
      },
      { $sort: { rides: -1 } },
      { $limit: 10 }
    ]);
    
    // Populate driver info
    const populatedDrivers = await User.populate(topDrivers, {
      path: '_id',
      select: 'name driver_rating'
    });
    
    res.json({
      dailyRides,
      topDrivers: populatedDrivers
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
