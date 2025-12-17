const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register new customer
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }
    
    // Create customer account (all role flags = false by default)
    const user = new User({
      name,
      email,
      phone,
      password,
      role_base: 'customer'
    });
    
    await user.save();
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_base: user.role_base,
        is_driver: user.is_driver,
        is_manager: user.is_manager,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user (customer/driver/manager/admin)
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user (need password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check if suspended
    if (user.is_suspended) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role_base: user.role_base,
        is_driver: user.is_driver,
        is_manager: user.is_manager,
        is_admin: user.is_admin,
        driver_status: user.driver_status,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePicture: user.profilePicture,
        role_base: user.role_base,
        is_driver: user.is_driver,
        is_manager: user.is_manager,
        is_admin: user.is_admin,
        driver_status: user.driver_status,
        driver_rating: user.driver_rating,
        driver_application_status: user.driver_application_status,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/auth/apply-driver
// @desc    Apply to become a driver
// @access  Private
exports.applyAsDriver = async (req, res) => {
  try {
    const { vehicle_info, driver_documents } = req.body;

    // Validation
    if (!vehicle_info || !driver_documents) {
      return res.status(400).json({ error: 'Vehicle info and driver documents are required' });
    }

    const user = await User.findById(req.user._id);

    // Check if already a driver or has pending application
    if (user.is_driver) {
      return res.status(400).json({ error: 'You are already a driver' });
    }

    if (user.driver_application_status === 'pending') {
      return res.status(400).json({ error: 'You already have a pending application' });
    }

    // Update user with driver application data
    user.vehicle_info = vehicle_info;
    user.driver_documents = driver_documents;
    user.driver_application_status = 'pending';
    
    await user.save();

    res.json({
      message: 'Driver application submitted successfully',
      user: {
        id: user._id,
        driver_application_status: user.driver_application_status
      }
    });
  } catch (error) {
    console.error('Apply driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
