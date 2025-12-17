import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// For local testing: http://localhost:5000
// For Expo Go on physical device: http://YOUR_IP:5000
// For deployed backend: https://your-app.render.com
const API_URL = 'http://192.168.0.12:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('userToken');
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getWallet: () => api.get('/user/wallet'),
  addMoney: (amount) => api.post('/user/wallet/add', { amount }),
  getTransactions: () => api.get('/user/transactions'),
};

// Ride APIs
export const rideAPI = {
  getFareEstimate: (pickup, dropoff) => api.get('/rides/fare-estimate', { 
    params: { 
      pickupLat: pickup.lat, 
      pickupLng: pickup.lng, 
      dropoffLat: dropoff.lat, 
      dropoffLng: dropoff.lng 
    } 
  }),
  createRide: (pickup, dropoff, vehicle_type, scheduled_time) => 
    api.post('/rides/create', { pickup, dropoff, vehicle_type, scheduled_time }),
  cancelRide: (id, driver_late = false) => api.post(`/rides/${id}/cancel`, { driver_late }),
  startTrip: (id) => api.post(`/rides/${id}/start`),
  completeTrip: (id) => api.post(`/rides/${id}/complete`),
  getRide: (id) => api.get(`/rides/${id}`),
  rateRide: (id, rating, comment) => api.post(`/rides/${id}/rate`, { rating, comment }),
  getHistory: () => api.get('/rides/history'),
  clearHistory: () => api.delete('/rides/history/clear'),
};

// Driver APIs
export const driverAPI = {
  apply: (vehicle_info) => api.post('/driver/apply', { vehicle_info }),
  getApplication: () => api.get('/driver/application'),
  goOnline: (lat, lng) => api.post('/driver/online', { lat, lng }),
  goOffline: () => api.post('/driver/offline'),
  updateLocation: (lat, lng) => api.post('/driver/location', { lat, lng }),
  acceptRide: (id) => api.post(`/driver/rides/${id}/accept`),
  rejectRide: (id) => api.post(`/driver/rides/${id}/reject`),
  startTrip: (id) => api.post(`/driver/rides/${id}/start`),
  completeTrip: (id) => api.post(`/driver/rides/${id}/complete`),
  getEarnings: () => api.get('/driver/earnings'),
  getActiveRide: () => api.get('/driver/rides/active'),
};

// Chat APIs
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (id) => api.get(`/chat/${id}`),
  sendMessage: (subject, message) => api.post('/chat/send', { subject, message }),
};

export default api;
