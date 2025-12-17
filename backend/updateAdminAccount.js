const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function updateAdminAccount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete any old admin accounts
    await User.deleteOne({ email: 'saniya.cse123125@bppimt.com' });
    await User.deleteOne({ email: 'admin@ubar.com' });
    console.log('Deleted old admin accounts if they existed');

    // Find and update the admin account
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
      // Create new admin account if it doesn't exist
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

    console.log('\n🎉 Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminAccount();
