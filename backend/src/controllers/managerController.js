const User = require('../models/User');
const Ride = require('../models/Ride');
const Chat = require('../models/Chat');
const Transaction = require('../models/Transaction');

// @route   GET /api/manager/dashboard
// @desc    Get manager dashboard statistics
// @access  Private (Manager only)
exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Total users
    const totalUsers = await User.countDocuments({ role_base: 'customer' });
    const totalDrivers = await User.countDocuments({ is_driver: true });
    
    // Total rides
    const totalRides = await Ride.countDocuments();
    const todayRides = await Ride.countDocuments({ createdAt: { $gte: today } });
    const activeRides = await Ride.countDocuments({ status: { $in: ['requested', 'assigned', 'en_route'] } });
    
    // Revenue
    const revenueData = await Transaction.aggregate([
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
    
    // Pending driver applications
    const pendingApplications = await User.countDocuments({ driver_application_status: 'pending' });
    
    // Open support tickets
    const openTickets = await Chat.countDocuments({ status: 'open' });
    
    res.json({
      users: {
        total: totalUsers,
        drivers: totalDrivers
      },
      rides: {
        total: totalRides,
        today: todayRides,
        active: activeRides
      },
      revenue: {
        total: revenueData[0]?.total || 0,
        today: todayRevenue[0]?.total || 0
      },
      pendingApplications,
      openTickets
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/manager/users
// @desc    Get all users with search and filter
// @access  Private (Manager only)
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role === 'customer') {
      query.is_driver = false;
      query.is_manager = false;
      query.is_admin = false;
    } else if (role === 'driver') {
      query.is_driver = true;
    } else if (role === 'manager') {
      query.is_manager = true;
    } else if (role === 'admin') {
      query.is_admin = true;
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
      currentPage: page
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/manager/rides
// @desc    Get all rides
// @access  Private (Manager only)
exports.getAllRides = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const rides = await Ride.find(query)
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone vehicle_info')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Ride.countDocuments(query);
    
    res.json({
      rides,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/manager/rides/active
// @desc    Get all active rides
// @access  Private (Manager only)
exports.getActiveRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: { $in: ['requested', 'assigned', 'en_route'] }
    })
      .populate('customer', 'name phone')
      .populate('driver', 'name phone vehicle_info')
      .sort({ createdAt: -1 });
    
    res.json({ rides });
  } catch (error) {
    console.error('Get active rides error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/manager/chats
// @desc    Get all support conversations
// @access  Private (Manager only)
exports.getChatConversations = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }
    
    const conversations = await Chat.find(query)
      .populate('user', 'name email phone profilePicture')
      .sort({ updatedAt: -1 });
    
    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
