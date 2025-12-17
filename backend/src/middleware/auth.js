const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    if (user.is_suspended) {
      return res.status(403).json({ error: 'Account suspended. Contact support.' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if user has driver role
const requireDriver = (req, res, next) => {
  if (!req.user.is_driver) {
    return res.status(403).json({ error: 'Access denied. Driver role required.' });
  }
  next();
};

// Check if user has manager role
const requireManager = (req, res, next) => {
  if (!req.user.is_manager) {
    return res.status(403).json({ error: 'Access denied. Manager role required.' });
  }
  next();
};

// Check if user has admin role
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { auth, requireDriver, requireManager, requireAdmin };
