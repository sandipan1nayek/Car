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

// Mock location search - Popular locations in Kolkata, West Bengal, India
const mockLocations = [
  { name: 'Victoria Memorial', address: 'Victoria Memorial, Maidan, Kolkata', lat: 22.5448, lng: 88.3426 },
  { name: 'Howrah Bridge', address: 'Howrah Bridge, Kolkata', lat: 22.5851, lng: 88.3468 },
  { name: 'Park Street', address: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3525 },
  { name: 'Salt Lake Stadium', address: 'Salt Lake Stadium, Bidhannagar, Kolkata', lat: 22.5645, lng: 88.4118 },
  { name: 'Netaji Subhas Airport', address: 'Netaji Subhas Chandra Bose International Airport (CCU)', lat: 22.6546, lng: 88.4467 },
  { name: 'Sealdah Railway Station', address: 'Sealdah Railway Station, Kolkata', lat: 22.5677, lng: 88.3695 },
  { name: 'Dakshineswar Temple', address: 'Dakshineswar Kali Temple, Kolkata', lat: 22.6547, lng: 88.3573 },
  { name: 'Science City', address: 'Science City, EM Bypass, Kolkata', lat: 22.5394, lng: 88.3954 },
  { name: 'Eden Gardens', address: 'Eden Gardens Cricket Stadium, Kolkata', lat: 22.5645, lng: 88.3433 },
  { name: 'Esplanade', address: 'Esplanade, BBD Bagh, Kolkata', lat: 22.5626, lng: 88.3510 },
  { name: 'New Market', address: 'New Market, Lindsay Street, Kolkata', lat: 22.5558, lng: 88.3508 },
  { name: 'Alipore Zoo', address: 'Alipore Zoological Gardens, Kolkata', lat: 22.5330, lng: 88.3337 }
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
