const User = require('../models/User');
const Ride = require('../models/Ride');
const Transaction = require('../models/Transaction');
const DriverLocation = require('../models/DriverLocation');
const { uploadImage } = require('../services/cloudinaryService');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @route   POST /api/driver/apply
// @desc    Apply to become a driver
// @access  Private
exports.applyDriver = async (req, res) => {
  try {
    const { vehicle_info, documents } = req.body;
    
    // Check if already applied or is driver
    if (req.user.is_driver) {
      return res.status(400).json({ error: 'You are already a driver' });
    }
    
    if (req.user.driver_application_status === 'pending') {
      return res.status(400).json({ error: 'Application already submitted' });
    }
    
    // Validation
    if (!vehicle_info || !vehicle_info.make || !vehicle_info.model || !vehicle_info.plate) {
      return res.status(400).json({ error: 'Vehicle information is required' });
    }
    
    // Handle document uploads (or use placeholders for demo)
    const uploadedDocs = {};
    if (documents) {
      for (const [key, doc] of Object.entries(documents)) {
        const result = await uploadImage(doc, 'driver-documents');
        uploadedDocs[key] = result.success ? result.url : `https://via.placeholder.com/400x300?text=${key}`;
      }
    } else {
      // Demo placeholders
      uploadedDocs.license = 'https://via.placeholder.com/400x300?text=Driver+License';
      uploadedDocs.vehicleRegistration = 'https://via.placeholder.com/400x300?text=Vehicle+Registration';
      uploadedDocs.insurance = 'https://via.placeholder.com/400x300?text=Insurance';
    }
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        driver_application_status: 'pending',
        vehicle_info,
        driver_documents: uploadedDocs
      },
      { new: true }
    );
    
    // Send email to all admins
    const admins = await User.find({ is_admin: true });
    for (const admin of admins) {
      const template = emailTemplates.driverApplicationSubmitted(
        user.name,
        user.email,
        user.phone
      );
      await sendEmail({
        to: admin.email,
        subject: template.subject,
        html: template.html
      });
    }
    
    res.json({
      message: 'Application submitted successfully. You will be notified once reviewed.',
      application_status: 'pending'
    });
  } catch (error) {
    console.error('Apply driver error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/driver/application
// @desc    Get driver application status
// @access  Private
exports.getApplication = async (req, res) => {
  try {
    res.json({
      status: req.user.driver_application_status,
      is_driver: req.user.is_driver,
      vehicle_info: req.user.vehicle_info,
      documents: req.user.driver_documents
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/online
// @desc    Go online
// @access  Private (Driver only)
exports.goOnline = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    // Update driver status
    await User.findByIdAndUpdate(req.user._id, {
      driver_status: 'online'
    });
    
    // Save/Update driver location
    await DriverLocation.findOneAndUpdate(
      { driver: req.user._id },
      {
        driver: req.user._id,
        location: {
          type: 'Point',
          coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
        },
        is_online: true,
        timestamp: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'You are now online', status: 'online' });
  } catch (error) {
    console.error('Go online error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/offline
// @desc    Go offline
// @access  Private (Driver only)
exports.goOffline = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      driver_status: 'offline'
    });
    
    await DriverLocation.findOneAndUpdate(
      { driver: req.user._id },
      { is_online: false }
    );
    
    res.json({ message: 'You are now offline', status: 'offline' });
  } catch (error) {
    console.error('Go offline error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/location
// @desc    Update driver location
// @access  Private (Driver only)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    await DriverLocation.findOneAndUpdate(
      { driver: req.user._id },
      {
        driver: req.user._id,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        timestamp: new Date()
      },
      { upsert: true }
    );
    
    // Find active ride for this driver
    const activeRide = await Ride.findOne({
      driver: req.user._id,
      status: { $in: ['assigned', 'en_route'] }
    });
    
    // Broadcast location to customer if in active ride
    if (activeRide && global.io) {
      global.io.emit(`ride_${activeRide._id}_driver_location`, { lat, lng });
    }
    
    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/rides/:id/accept
// @desc    Accept ride request
// @access  Private (Driver only)
exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'requested') {
      return res.status(400).json({ error: 'Ride is no longer available' });
    }
    
    // Assign driver to ride and set driver status to on_ride
    ride.driver = req.user._id;
    ride.status = 'assigned';
    ride.accepted_at = new Date();
    await ride.save();
    
    // Update driver status to on_ride
    await User.findByIdAndUpdate(req.user._id, {
      driver_status: 'on_ride'
    });
    
    const populatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone profilePicture')
      .populate('driver', 'name phone profilePicture vehicle_info driver_rating');
    
    // Notify customer
    if (global.io) {
      global.io.emit(`customer_${ride.customer}_ride_assigned`, {
        rideId: ride._id,
        driver: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          profilePicture: req.user.profilePicture,
          rating: req.user.driver_rating,
          vehicle: req.user.vehicle_info
        }
      });
    }
    
    res.json({ message: 'Ride accepted', ride: populatedRide });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/rides/:id/reject
// @desc    Reject ride request
// @access  Private (Driver only)
exports.rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    // Find next nearest driver and send request
    // For demo, just respond success
    
    res.json({ message: 'Ride rejected' });
  } catch (error) {
    console.error('Reject ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/rides/:id/start
// @desc    Start trip
// @access  Private (Driver only)
exports.startTrip = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (ride.status !== 'assigned') {
      return res.status(400).json({ error: 'Cannot start this ride' });
    }
    
    ride.status = 'en_route';
    ride.started_at = new Date();
    await ride.save();
    
    // Notify customer
    if (global.io) {
      global.io.emit(`customer_${ride.customer}_ride_started`, {
        rideId: ride._id
      });
    }
    
    res.json({ message: 'Trip started', ride });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/driver/rides/:id/complete
// @desc    Complete trip and process payment
// @access  Private (Driver only)
exports.completeTrip = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('customer driver');
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.driver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (ride.status !== 'en_route') {
      return res.status(400).json({ error: 'Cannot complete this ride' });
    }
    
    // Mark ride as completed
    ride.status = 'completed';
    ride.completed_at = new Date();
    ride.fare_final = ride.fare_estimated;
    await ride.save();
    
    // Process payment
    const platformFee = Math.round(ride.fare_final * (parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 15) / 100);
    const driverEarning = ride.fare_final - platformFee;
    
    // Deduct from customer wallet
    const customer = await User.findById(ride.customer._id);
    const customerOldBalance = customer.wallet_balance;
    customer.wallet_balance -= ride.fare_final;
    await customer.save();
    
    await Transaction.create({
      user: customer._id,
      type: 'ride_payment',
      amount: -ride.fare_final,
      balance_before: customerOldBalance,
      balance_after: customer.wallet_balance,
      ride: ride._id,
      description: `Payment for ride from ${ride.pickup.address} to ${ride.dropoff.address}`,
      status: 'completed'
    });
    
    // Add to driver wallet and set driver back to online
    const driver = await User.findById(req.user._id);
    const driverOldBalance = driver.wallet_balance;
    driver.wallet_balance += driverEarning;
    driver.total_rides_completed += 1;
    driver.driver_status = 'online'; // Set driver back to online after completing ride
    await driver.save();
    
    await Transaction.create({
      user: driver._id,
      type: 'ride_earning',
      amount: driverEarning,
      balance_before: driverOldBalance,
      balance_after: driver.wallet_balance,
      ride: ride._id,
      description: `Earning from ride`,
      status: 'completed'
    });
    
    // Send receipt email to customer
    const template = emailTemplates.rideReceipt(
      customer.name,
      ride.pickup.address,
      ride.dropoff.address,
      ride.distance_km,
      ride.fare_final,
      driver.name,
      driver.driver_rating
    );
    await sendEmail({
      to: customer.email,
      subject: template.subject,
      html: template.html
    });
    
    // Notify customer
    if (global.io) {
      global.io.emit(`customer_${ride.customer._id}_ride_completed`, {
        rideId: ride._id,
        fare: ride.fare_final
      });
    }
    
    res.json({
      message: 'Trip completed successfully',
      ride,
      earning: driverEarning,
      platformFee
    });
  } catch (error) {
    console.error('Complete trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/driver/earnings
// @desc    Get driver earnings
// @access  Private (Driver only)
exports.getEarnings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    // Get transactions
    const todayEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'ride_earning',
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const weekEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'ride_earning',
          createdAt: { $gte: thisWeek }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const monthEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'ride_earning',
          createdAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const allTimeEarnings = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'ride_earning'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      today: {
        earning: todayEarnings[0]?.total || 0,
        rides: todayEarnings[0]?.count || 0
      },
      week: weekEarnings[0]?.total || 0,
      month: monthEarnings[0]?.total || 0,
      allTime: allTimeEarnings[0]?.total || 0,
      totalRidesCompleted: req.user.total_rides_completed,
      rating: req.user.driver_rating
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/driver/rides/active
// @desc    Get active ride for driver
// @access  Private (Driver only)
exports.getActiveRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      driver: req.user._id,
      status: { $in: ['assigned', 'en_route'] }
    }).populate('customer', 'name phone profilePicture');
    
    res.json({ ride: ride || null });
  } catch (error) {
    console.error('Get active ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
