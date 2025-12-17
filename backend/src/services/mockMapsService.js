// Mock Google Maps Service for Demo (No API Key Required)

// Calculate straight-line distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

// Mock location search (returns predefined locations)
const mockLocations = [
  { name: 'Downtown Plaza', address: 'Downtown Plaza, City Center', lat: 40.7128, lng: -74.0060 },
  { name: 'Central Station', address: 'Central Station, Main Street', lat: 40.7589, lng: -73.9851 },
  { name: 'Airport Terminal', address: 'Airport Terminal, Highway 1', lat: 40.6413, lng: -73.7781 },
  { name: 'Shopping Mall', address: 'Grand Shopping Mall, 5th Avenue', lat: 40.7614, lng: -73.9776 },
  { name: 'Business District', address: 'Business District, Corporate Park', lat: 40.7549, lng: -73.9840 },
  { name: 'University Campus', address: 'University Campus, College Road', lat: 40.8075, lng: -73.9626 },
  { name: 'Hospital', address: 'City Hospital, Medical Center', lat: 40.7794, lng: -73.9632 },
  { name: 'Park Avenue', address: 'Park Avenue, Residential Area', lat: 40.7673, lng: -73.9702 },
  { name: 'Beach Front', address: 'Beach Front, Coastal Road', lat: 40.5731, lng: -73.9712 },
  { name: 'Tech Hub', address: 'Tech Hub, Innovation Street', lat: 40.7484, lng: -73.9857 }
];

// Search for location (mock autocomplete)
const searchLocation = async (query) => {
  try {
    // If no query, return some default locations
    if (!query || query.trim() === '') {
      return mockLocations.slice(0, 5);
    }
    
    // Filter locations by query
    const filtered = mockLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      loc.address.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered : mockLocations.slice(0, 3);
  } catch (error) {
    console.error('Mock location search error:', error);
    return mockLocations.slice(0, 3);
  }
};

// Get directions (mock route)
const getDirections = async (pickupLat, pickupLng, dropoffLat, dropoffLng) => {
  try {
    const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const duration = Math.round((distance / 40) * 60); // Assume 40 km/h average speed
    
    return {
      distance_km: distance,
      duration_min: duration,
      route: {
        pickup: { lat: pickupLat, lng: pickupLng },
        dropoff: { lat: dropoffLat, lng: dropoffLng }
      }
    };
  } catch (error) {
    console.error('Mock directions error:', error);
    return {
      distance_km: 5,
      duration_min: 15,
      route: {
        pickup: { lat: pickupLat, lng: pickupLng },
        dropoff: { lat: dropoffLat, lng: dropoffLng }
      }
    };
  }
};

// Reverse geocode (get address from coordinates)
const reverseGeocode = async (lat, lng) => {
  try {
    // Find closest mock location
    let closest = mockLocations[0];
    let minDistance = calculateDistance(lat, lng, closest.lat, closest.lng);
    
    for (const loc of mockLocations) {
      const dist = calculateDistance(lat, lng, loc.lat, loc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = loc;
      }
    }
    
    return {
      address: closest.address,
      lat,
      lng
    };
  } catch (error) {
    console.error('Mock reverse geocode error:', error);
    return {
      address: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      lat,
      lng
    };
  }
};

// Calculate fare estimate
const calculateFare = (distance_km) => {
  const baseFare = parseFloat(process.env.BASE_FARE) || 50;
  const perKmRate = parseFloat(process.env.PER_KM_RATE) || 15;
  const minimumFare = parseFloat(process.env.MINIMUM_FARE) || 50;
  
  let fare = baseFare + (distance_km * perKmRate);
  if (fare < minimumFare) {
    fare = minimumFare;
  }
  
  return Math.round(fare);
};

// Find nearby drivers (mock - returns random nearby coordinates)
const getNearbyDrivers = async (lat, lng, radiusKm = 5) => {
  try {
    // Generate 3-5 random drivers within radius
    const numDrivers = Math.floor(Math.random() * 3) + 3; // 3-5 drivers
    const drivers = [];
    
    for (let i = 0; i < numDrivers; i++) {
      // Random offset within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm;
      const latOffset = (distance / 111) * Math.cos(angle); // 111 km per degree lat
      const lngOffset = (distance / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
      
      drivers.push({
        lat: lat + latOffset,
        lng: lng + lngOffset,
        distance: Math.round(distance * 10) / 10
      });
    }
    
    return drivers.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Mock nearby drivers error:', error);
    return [];
  }
};

module.exports = {
  calculateDistance,
  searchLocation,
  getDirections,
  reverseGeocode,
  calculateFare,
  getNearbyDrivers
};
