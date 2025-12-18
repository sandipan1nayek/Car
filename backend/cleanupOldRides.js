require('dotenv').config();
const mongoose = require('mongoose');
const Ride = require('./src/models/Ride');
const User = require('./src/models/User');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Count rides before deletion
    const rideCount = await Ride.countDocuments({});
    console.log(`📊 Found ${rideCount} rides`);

    // Delete all rides
    const deletedRides = await Ride.deleteMany({});
    console.log(`🗑️  Deleted ${deletedRides.deletedCount} rides`);

    // Reset all driver statuses to offline and clear ride count
    const updatedDrivers = await User.updateMany(
      { is_driver: true },
      { 
        driver_status: 'offline',
        total_rides_completed: 0
      }
    );
    console.log(`🔄 Reset ${updatedDrivers.modifiedCount} drivers to offline`);

    console.log('\n✅ Cleanup complete!');
    console.log('📝 All test rides deleted');
    console.log('📝 All drivers reset to offline (they can go online manually)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();
