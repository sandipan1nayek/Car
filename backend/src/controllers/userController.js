const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { uploadImage } = require('../services/cloudinaryService');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, email_preferences } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email_preferences) updates.email_preferences = email_preferences;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/user/profile-picture
// @desc    Upload profile picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { image } = req.body; // Base64 image
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }
    
    // Try to upload to Cloudinary, fallback to placeholder
    const result = await uploadImage(image, 'profile-pictures');
    
    let imageUrl;
    if (result.success) {
      imageUrl = result.url;
    } else {
      // Use placeholder image for demo
      imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user.name)}&size=200&background=random`;
      console.log('Using placeholder image (Cloudinary not configured)');
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: imageUrl },
      { new: true }
    );
    
    res.json({ message: 'Profile picture updated', profilePicture: imageUrl, user });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/user/wallet
// @desc    Get wallet balance
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ balance: user.wallet_balance });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/user/wallet/add
// @desc    Add money to wallet (simulation for demo)
// @access  Private
exports.addMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (amount > 10000) {
      return res.status(400).json({ error: 'Maximum amount is 10000' });
    }
    
    const user = await User.findById(req.user._id);
    const oldBalance = user.wallet_balance;
    const newBalance = oldBalance + amount;
    
    // Update wallet
    user.wallet_balance = newBalance;
    await user.save();
    
    // Create transaction record
    await Transaction.create({
      user: user._id,
      type: 'wallet_add',
      amount: amount,
      balance_before: oldBalance,
      balance_after: newBalance,
      description: `Added money to wallet`,
      status: 'completed'
    });
    
    res.json({
      message: 'Money added successfully',
      balance: newBalance,
      amount: amount
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/user/transactions
// @desc    Get transaction history
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('ride', 'pickup.address dropoff.address');
    
    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
