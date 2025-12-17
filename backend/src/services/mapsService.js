const mockMapsService = require('./mockMapsService');
const axios = require('axios');

const isUsingMockData = !process.env.GOOGLE_MAPS_API_KEY || 
                        process.env.GOOGLE_MAPS_API_KEY === 'DEMO_MODE' ||
                        process.env.GOOGLE_MAPS_API_KEY === '';

if (isUsingMockData) {
  console.log('🗺️  Using MOCK Google Maps data (no API key required)');
} else {
  console.log('🗺️  Using real Google Maps API');
}

// Search location with autocomplete
const searchLocation = async (query) => {
  if (isUsingMockData) {
    return await mockMapsService.searchLocation(query);
  }
  
  try {
    // Real Google Maps Places API call would go here
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: query,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    return response.data.predictions;
  } catch (error) {
    console.error('Google Maps API error, falling back to mock:', error.message);
    return await mockMapsService.searchLocation(query);
  }
};

// Get directions between two points
const getDirections = async (pickupLat, pickupLng, dropoffLat, dropoffLng) => {
  if (isUsingMockData) {
    return await mockMapsService.getDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
  }
  
  try {
    // Real Google Maps Directions API call would go here
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${pickupLat},${pickupLng}`,
        destination: `${dropoffLat},${dropoffLng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    
    const route = response.data.routes[0];
    const leg = route.legs[0];
    
    return {
      distance_km: leg.distance.value / 1000,
      duration_min: Math.round(leg.duration.value / 60),
      route: response.data
    };
  } catch (error) {
    console.error('Google Maps API error, falling back to mock:', error.message);
    return await mockMapsService.getDirections(pickupLat, pickupLng, dropoffLat, dropoffLng);
  }
};

// Reverse geocode (coordinates to address)
const reverseGeocode = async (lat, lng) => {
  if (isUsingMockData) {
    return await mockMapsService.reverseGeocode(lat, lng);
  }
  
  try {
    // Real Google Maps Geocoding API call would go here
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    
    return {
      address: response.data.results[0].formatted_address,
      lat,
      lng
    };
  } catch (error) {
    console.error('Google Maps API error, falling back to mock:', error.message);
    return await mockMapsService.reverseGeocode(lat, lng);
  }
};

// Calculate fare
const calculateFare = (distance_km) => {
  return mockMapsService.calculateFare(distance_km);
};

// Calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  return mockMapsService.calculateDistance(lat1, lng1, lat2, lng2);
};

// Get nearby drivers
const getNearbyDrivers = async (lat, lng, radiusKm = 5) => {
  return await mockMapsService.getNearbyDrivers(lat, lng, radiusKm);
};

module.exports = {
  searchLocation,
  getDirections,
  reverseGeocode,
  calculateFare,
  calculateDistance,
  getNearbyDrivers,
  isUsingMockData
};
