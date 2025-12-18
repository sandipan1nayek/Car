// API Configuration - CHANGE THIS BEFORE DEPLOYMENT
// This file centralizes all API URLs for easy deployment

// DEPLOYMENT INSTRUCTIONS:
// 1. Deploy backend to Railway/Render
// 2. Copy the deployment URL (e.g., https://your-app.up.railway.app)
// 3. Replace DEPLOYED_BACKEND_URL with your actual URL
// 4. Test on Expo Go FIRST before building APK
// 5. If all works, build production APK

// ===== CONFIGURATION =====
const DEPLOYED_BACKEND_URL = 'https://your-app.up.railway.app'; // REPLACE THIS
const LOCAL_BACKEND_URL = 'http://192.168.0.18:5000';

// Change this to true when deploying globally
const USE_PRODUCTION = false;

// ===== DO NOT EDIT BELOW THIS LINE =====
const BASE_URL = USE_PRODUCTION ? DEPLOYED_BACKEND_URL : LOCAL_BACKEND_URL;

export const API_CONFIG = {
  API_BASE_URL: `${BASE_URL}/api`,
  SOCKET_URL: BASE_URL,
  TIMEOUT: 30000, // 30 seconds for production (slower than local)
};

// Export for easy access
export const { API_BASE_URL, SOCKET_URL, TIMEOUT } = API_CONFIG;
