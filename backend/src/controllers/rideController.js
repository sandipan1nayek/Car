const Ride = require('../models/Ride');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DriverLocation = require('../models/DriverLocation');
const mapsService = require('../services/mapsService');
const { sendEmail, emailTemplates } = require('../services/emailService');

// @route   POST /api/rides/create
// @desc    Create new ride request
// @access  Private
exports.createRide = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;
    
    // Validation
    if (!pickup || !pickup.lat || !pickup.lng || !pickup.address) {
      return res.status(400).json({ error: 'Pickup location is required' });
    }
    if (!dropoff || !dropoff.lat || !dropoff.lng || !dropoff.address) {
      return res.status(400).json({ error: 'Dropoff location is required' });
    }
    
    // Calculate distance and fare
    const directions = await mapsService.getDirections(
      pickup.lat, pickup.lng,
      dropoff.lat, dropoff.lng
    );
    
    const fare = mapsService.calculateFare(directions.distance_km);
    
    // Check wallet balance
    const user = await User.findById(req.user._id);
    if (user.wallet_balance < fare) {
      return res.status(400).json({ 
        error: 'Insufficient wallet balance',
        required: fare,
        current: user.wallet_balance
      });
    }
    
    // Create ride
    const ride = await Ride.create({
      customer: req.user._id,
      pickup,
      dropoff,
      distance_km: directions.distance_km,
      estimated_duration_min: directions.duration_min,
      fare_estimated: fare,
      status: 'requested'
    });
    
    // Find nearby online drivers
    const nearbyDrivers = await DriverLocation.find({
      is_online: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [pickup.lng, pickup.lat]
          },
          $maxDistance: 5000 // 5km radius
        }
      }
    }).populate('driver');
    
    // Send ride request to nearest driver via Socket.io
    if (nearbyDrivers.length > 0 && global.io) {
      const nearestDriver = nearbyDrivers[0].driver;
      global.io.emit(`driver_${nearestDriver._id}_ride_request`, {
        rideId: ride._id,
        customer: {
          name: user.name,
          phone: user.phone,
          profilePicture: user.profilePicture
        },
        pickup,
        dropoff,
        distance: directions.distance_km,
        fare,
        estimatedDuration: directions.duration_min
      });
    }
    
    const populatedRide = await Ride.findById(ride._id)
      .populate('customer', 'name phone profilePicture');
    
    res.status(201).json({
      message: 'Ride requested successfully',
      ride: populatedRide,
      nearbyDriversCount: nearbyDrivers.length
    });
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/rides/fare-estimate
// @desc    Calculate fare estimate
// @access  Private
exports.getFareEstimate = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng } = req.query;
    
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({ error: 'All coordinates are required' });
    }
    
    const directions = await mapsService.getDirections(
      parseFloat(pickupLat),
      parseFloat(pickupLng),
      parseFloat(dropoffLat),
      parseFloat(dropoffLng)
    );
    
    const fare = mapsService.calculateFare(directions.distance_km);
    
    res.json({
      distance_km: directions.distance_km,
      duration_min: directions.duration_min,
      fare: fare,
      breakdown: {
        baseFare: parseFloat(process.env.BASE_FARE) || 50,
        perKmRate: parseFloat(process.env.PER_KM_RATE) || 15,
        distanceCost: directions.distance_km * (parseFloat(process.env.PER_KM_RATE) || 15)
      }
    });
  } catch (error) {
    console.error('Fare estimate error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/rides/:id/cancel
// @desc    Cancel ride
// @access  Private
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    // Check if user owns this ride
    if (ride.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Can only cancel if not completed
    if (ride.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed ride' });
    }
    
    ride.status = 'cancelled';
    ride.cancelled_at = new Date();
    ride.cancelled_by = 'customer';
    ride.cancellation_reason = req.body.reason || 'Cancelled by customer';
    await ride.save();
    
    // Notify driver if ride was assigned
    if (ride.driver && global.io) {
      global.io.emit(`driver_${ride.driver}_ride_cancelled`, {
        rideId: ride._id,
        reason: ride.cancellation_reason
      });
    }
    
    res.json({ message: 'Ride cancelled successfully', ride });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/rides/:id
// @desc    Get ride details
// @access  Private
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('customer', 'name phone profilePicture')
      .populate('driver', 'name phone profilePicture vehicle_info driver_rating');
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    // Check authorization
    const isCustomer = ride.customer._id.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver._id.toString() === req.user._id.toString();
    const isManagerOrAdmin = req.user.is_manager || req.user.is_admin;
    
    if (!isCustomer && !isDriver && !isManagerOrAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    res.json({ ride });
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   POST /api/rides/:id/rate
// @desc    Rate ride after completion
// @access  Private
exports.rateRide = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'completed') {
      return res.status(400).json({ error: 'Can only rate completed rides' });
    }
    
    const isCustomer = ride.customer.toString() === req.user._id.toString();
    const isDriver = ride.driver && ride.driver.toString() === req.user._id.toString();
    
    if (!isCustomer && !isDriver) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Customer rating driver
    if (isCustomer) {
      if (ride.customer_rating && ride.customer_rating.rating) {
        return res.status(400).json({ error: 'You have already rated this ride' });
      }
      
      ride.customer_rating = { rating, comment: comment || '' };
      await ride.save();
      
      // Update driver's average rating
      const driver = await User.findById(ride.driver);
      const allRides = await Ride.find({
        driver: ride.driver,
        status: 'completed',
        'customer_rating.rating': { $exists: true }
      });
      
      const avgRating = allRides.reduce((sum, r) => sum + r.customer_rating.rating, 0) / allRides.length;
      driver.driver_rating = Math.round(avgRating * 10) / 10;
      await driver.save();
    }
    
    // Driver rating customer
    if (isDriver) {
      if (ride.driver_rating && ride.driver_rating.rating) {
        return res.status(400).json({ error: 'You have already rated this ride' });
      }
      
      ride.driver_rating = { rating, comment: comment || '' };
      await ride.save();
    }
    
    res.json({ message: 'Rating submitted successfully', ride });
  } catch (error) {
    console.error('Rate ride error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @route   GET /api/rides
// @desc    Get user's ride history
// @access  Private
exports.getRideHistory = async (req, res) => {
  try {
    const rides = await Ride.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('driver', 'name profilePicture driver_rating vehicle_info');
    
    res.json({ rides });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = exports;
