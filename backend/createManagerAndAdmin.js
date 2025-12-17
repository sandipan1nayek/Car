const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function createManagerAndAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up old accounts
    await User.deleteOne({ email: 'manager@ubar.com' });
    await User.deleteOne({ email: 'admin@ubar.com' });
    await User.deleteOne({ email: 'saniya.cse123125@bppimt.com' });

    // Handle Manager Account
    let manager = await User.findOne({ email: 'sandipan.cse123123@bppimt.ac.in' });
    if (manager) {
      manager.is_manager = true;
      manager.name = 'Sandipan Nayek';
      manager.password = 'Sandipan@1'; // Will be hashed by pre-save hook
      await manager.save();
      console.log('✅ Manager account updated');
      console.log('   Email: sandipan.cse123123@bppimt.ac.in');
      console.log('   Password: Sandipan@1');
    } else {
      manager = new User({
        name: 'Sandipan Nayek',
        email: 'sandipan.cse123123@bppimt.ac.in',
        phone: '+918250848942',
        password: 'Sandipan@1',
        is_manager: true,
        wallet_balance: 0
      });
      await manager.save();
      console.log('✅ Manager account created');
      console.log('   Email: sandipan.cse123123@bppimt.ac.in');
      console.log('   Password: Sandipan@1');
    }

    // Handle Admin Account
    let admin = await User.findOne({ email: 'saniya.cse123125@bppimt.ac.in' });
    if (admin) {
      admin.is_admin = true;
      admin.name = 'Saniya Ghosh';
      admin.password = 'Saniya@1'; // Will be hashed by pre-save hook
      await admin.save();
      console.log('✅ Admin account updated');
      console.log('   Email: saniya.cse123125@bppimt.ac.in');
      console.log('   Password: Saniya@1');
    } else {
      admin = new User({
        name: 'Saniya Ghosh',
        email: 'saniya.cse123125@bppimt.ac.in',
        phone: '+919907186026',
        password: 'Saniya@1',
        is_admin: true,
        wallet_balance: 0
      });
      await admin.save();
      console.log('✅ Admin account created');
      console.log('   Email: saniya.cse123125@bppimt.ac.in');
      console.log('   Password: Saniya@1');
    }

    console.log('\n🎉 Setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createManagerAndAdmin();
