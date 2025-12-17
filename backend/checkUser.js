require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const userId = '6942d994e383efeb07a525fd';

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    console.log('\n========== CHECKING USER ==========');
    console.log('Looking for userId:', userId);
    console.log('Type:', typeof userId);
    console.log('Length:', userId.length);
    console.log('Is valid ObjectId format:', userId.match(/^[0-9a-fA-F]{24}$/));
    
    const user = await User.findById(userId);
    
    if (user) {
      console.log('\n✅ USER FOUND:');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Phone:', user.phone);
      console.log('is_driver:', user.is_driver);
      console.log('driver_application_status:', user.driver_application_status);
      console.log('vehicle_info:', user.vehicle_info);
      console.log('driver_documents:', user.driver_documents);
    } else {
      console.log('\n❌ USER NOT FOUND');
      
      // Try to find by other methods
      console.log('\n========== SEARCHING ALL PENDING DRIVERS ==========');
      const pending = await User.find({ driver_application_status: 'pending' });
      console.log('Found', pending.length, 'pending driver(s)');
      pending.forEach(p => {
        console.log('  -', p._id, '|', p.name, '|', p.email);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
