const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@carapp.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@carapp.com',
      phone: '+1234567890',
      password: 'Admin@123', // Change this password immediately after login
      role_base: 'customer',
      is_admin: true,
      is_manager: true, // Admin also has manager access
      wallet_balance: 0
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('===== LOGIN CREDENTIALS =====');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    console.log('=============================\n');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
