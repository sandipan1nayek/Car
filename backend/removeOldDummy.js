require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function removeOldDummy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find and remove John Smith or any old dummy drivers
    const oldDummies = await User.find({ 
      $or: [
        { name: 'John Smith' },
        { email: { $regex: /@example\.com$/ } }
      ]
    });

    console.log(`\nFound ${oldDummies.length} old dummy driver(s):`);
    oldDummies.forEach(d => console.log(`  - ${d.name} (${d.email})`));

    if (oldDummies.length > 0) {
      await User.deleteMany({ 
        $or: [
          { name: 'John Smith' },
          { email: { $regex: /@example\.com$/ } }
        ]
      });
      console.log(`\n✅ Removed ${oldDummies.length} old dummy driver(s)`);
    } else {
      console.log('\n✅ No old dummy drivers found');
    }

    // List current drivers
    const currentDrivers = await User.find({ is_driver: true });
    console.log(`\n📊 Current drivers in database: ${currentDrivers.length}`);
    currentDrivers.forEach(d => {
      console.log(`  - ${d.name} (${d.email}) ${d.is_dummy ? '[DUMMY]' : '[REAL]'}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeOldDummy();
