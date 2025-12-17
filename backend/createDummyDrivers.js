require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const dummyDrivers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.driver@dummy.com',
    phone: '+919876543210',
    password: 'Dummy@123',
    vehicle_info: {
      make: 'Maruti Suzuki',
      model: 'Swift Dzire',
      year: 2021,
      plate: 'WB 01 AB 1234',
      color: 'White'
    },
    driver_documents: {
      license: 'WB1234567890'
    },
    is_dummy: true
  },
  {
    name: 'Priya Sharma',
    email: 'priya.driver@dummy.com',
    phone: '+919876543211',
    password: 'Dummy@123',
    vehicle_info: {
      make: 'Hyundai',
      model: 'i20',
      year: 2022,
      plate: 'WB 02 CD 5678',
      color: 'Red'
    },
    driver_documents: {
      license: 'WB2345678901'
    },
    is_dummy: true
  },
  {
    name: 'Amit Patel',
    email: 'amit.driver@dummy.com',
    phone: '+919876543212',
    password: 'Dummy@123',
    vehicle_info: {
      make: 'Tata',
      model: 'Nexon',
      year: 2023,
      plate: 'WB 03 EF 9012',
      color: 'Blue'
    },
    driver_documents: {
      license: 'WB3456789012'
    },
    is_dummy: true
  },
  {
    name: 'Sneha Reddy',
    email: 'sneha.driver@dummy.com',
    phone: '+919876543213',
    password: 'Dummy@123',
    vehicle_info: {
      make: 'Honda',
      model: 'City',
      year: 2020,
      plate: 'WB 04 GH 3456',
      color: 'Silver'
    },
    driver_documents: {
      license: 'WB4567890123'
    },
    is_dummy: true
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.driver@dummy.com',
    phone: '+919876543214',
    password: 'Dummy@123',
    vehicle_info: {
      make: 'Mahindra',
      model: 'XUV300',
      year: 2022,
      plate: 'WB 05 IJ 7890',
      color: 'Black'
    },
    driver_documents: {
      license: 'WB5678901234'
    },
    is_dummy: true
  }
];

async function createDummyDrivers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    for (const driverData of dummyDrivers) {
      // Check if driver already exists
      const existing = await User.findOne({ email: driverData.email });
      
      if (existing) {
        console.log(`⚠️  Dummy driver ${driverData.name} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(driverData.password, 10);

      // Create driver
      const driver = new User({
        ...driverData,
        password: hashedPassword,
        is_driver: true,
        driver_status: 'offline',
        driver_application_status: 'approved',
        wallet_balance: 0
      });

      await driver.save();
      console.log(`✅ Created dummy driver: ${driverData.name} (${driverData.email})`);
    }

    console.log('\n🎉 All dummy drivers created successfully!');
    console.log('Total dummy drivers:', dummyDrivers.length);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDummyDrivers();
