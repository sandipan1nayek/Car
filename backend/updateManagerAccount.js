const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function updateManagerAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the manager account
    const manager = await User.findOne({ email: 'sandipan.cse123123@bppimt.ac.in' });
    if (manager) {
      manager.is_manager = true;
      manager.name = 'Sandipan Nayek';
      manager.password = 'Sandipan@1'; // Will be hashed by pre-save hook
      await manager.save();
      console.log('✅ Manager account updated');
      console.log('   Email: sandipan.cse123123@bppimt.ac.in');
      console.log('   Password: Sandipan@1');
    } else {
      console.log('⚠️  Manager account not found');
    }

    console.log('\n🎉 Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateManagerAccount();
