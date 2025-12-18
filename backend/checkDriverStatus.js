require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');

const driverUserId = '6942d994e383efeb07a525fd'; // Rupnandan kumar

async function checkDriverStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
    
    // Find Rupnandan
    const driver = await User.findById(driverUserId);
    
    if (!driver) {
      console.log('❌ Driver not found');
      process.exit(1);
    }
    
    console.log('========== DRIVER STATUS ==========');
    console.log('👤 Name:', driver.name);
    console.log('📧 Email:', driver.email);
    console.log('📞 Phone:', driver.phone);
    console.log('🚗 Is Driver:', driver.is_driver);
    console.log('🏷️  Dummy Driver:', driver.is_dummy);
    console.log('\n========== CURRENT STATUS ==========');
    console.log('📊 Driver Status:', driver.driver_status);
    console.log('🎯 Total Rides Completed:', driver.total_rides_completed || 0);
    console.log('\n========== WALLET ==========');
    console.log('💰 Current Balance:', driver.wallet_balance || 0, 'Rs');
    
    // Get transactions
    const transactions = await Transaction.find({ user: driverUserId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\n========== RECENT TRANSACTIONS ==========');
    if (transactions.length === 0) {
      console.log('No transactions found');
    } else {
      console.log(`Found ${transactions.length} transaction(s):\n`);
      transactions.forEach((txn, index) => {
        console.log(`${index + 1}. ${txn.type.toUpperCase()}`);
        console.log(`   Amount: ${txn.amount} Rs`);
        console.log(`   Description: ${txn.description}`);
        console.log(`   Date: ${txn.createdAt.toLocaleString()}`);
        console.log('');
      });
    }
    
    // Calculate total earnings
    const earnings = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(driverUserId), type: { $in: ['ride_earning', 'cancellation_fee'] } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]);
    
    console.log('========== EARNINGS BREAKDOWN ==========');
    if (earnings.length === 0) {
      console.log('No earnings yet');
    } else {
      earnings.forEach(e => {
        console.log(`${e._id}: ${e.total} Rs`);
      });
      const totalEarnings = earnings.reduce((sum, e) => sum + e.total, 0);
      console.log(`\n💵 Total Earnings: ${totalEarnings} Rs`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDriverStatus();
