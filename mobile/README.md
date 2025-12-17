# 🚗 Ride Sharing Mobile App

React Native mobile application built with Expo for the ride-sharing platform.

## ✅ Mobile App Status: FUNCTIONAL PROTOTYPE

### Features Implemented

✅ **Authentication**
- Login & Signup screens
- JWT token management
- AsyncStorage for persistence

✅ **Customer Features**
- Map-based ride booking
- Mock location selection
- Fare estimation
- Wallet management (add money)
- Profile view
- Role-based UI

✅ **Driver Features** (shows for approved drivers)
- Go Online/Offline toggle
- Earnings dashboard (today, week, month, all-time)
- Rides and rating statistics

✅ **Real-Time Integration**
- Socket.io connection
- API integration with backend
- JWT authentication headers

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Expo Go app on your phone (iOS/Android)
- Backend server running on http://localhost:5000

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Backend URL

Edit `src/services/api.js`:

```javascript
// For testing on physical device, use your computer's IP
const API_URL = 'http://YOUR_IP_ADDRESS:5000/api';

// For emulator/simulator
const API_URL = 'http://localhost:5000/api';

// For production
const API_URL = 'https://your-backend.render.com/api';
```

Also update `src/services/socket.js`:

```javascript
const SOCKET_URL = 'http://YOUR_IP_ADDRESS:5000';
```

### 3. Start App
```bash
npm start
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

---

## 📱 App Structure

```
mobile/
├── App.js                           # Main app entry
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Navigation setup
│   ├── context/
│   │   └── AuthContext.js          # Authentication state
│   ├── services/
│   │   ├── api.js                  # API client (axios)
│   │   └── socket.js               # Socket.io client
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js     # Login UI
│   │   │   └── SignupScreen.js    # Signup UI
│   │   ├── customer/
│   │   │   ├── HomeScreen.js      # Map + booking
│   │   │   ├── WalletScreen.js    # Add money, balance
│   │   │   └── ProfileScreen.js   # User info, logout
│   │   └── driver/
│   │       └── DriverDashboardScreen.js  # Driver features
│   └── components/                 # Reusable components
```

---

## 🎨 Screens

### Authentication
1. **Login** - Email & password
2. **Signup** - Name, email, phone, password

### Customer Tabs
1. **Home** - Map with location selection, fare estimate, book ride
2. **Wallet** - View balance, add money (simulated)
3. **Profile** - User info, roles, logout

### Driver Tab (shown only if `is_driver=true`)
4. **Driver Dashboard** - Online/offline toggle, earnings, stats

---

## 🔌 API Integration

### Implemented Endpoints

**Auth:**
- POST /api/auth/login
- POST /api/auth/signup
- GET /api/auth/me

**User:**
- GET /api/user/profile
- GET /api/user/wallet
- POST /api/user/wallet/add

**Ride:**
- POST /api/ride/fare-estimate
- POST /api/ride/create
- GET /api/ride/history

**Driver:**
- POST /api/driver/online
- POST /api/driver/offline
- GET /api/driver/earnings

---

## 🧪 Testing

### Test User Flow

1. **Open app** → See login screen
2. **Tap "Sign up"** → Create account
3. **Auto-login** → Navigate to Home screen
4. **Select pickup location** → Choose from list
5. **Select dropoff location** → Choose destination
6. **View fare estimate** → See distance, duration, price
7. **Book ride** → Creates ride request
8. **Go to Wallet** → Add money (simulated)
9. **Go to Profile** → View user info, logout

### Test Admin Login
```
Email: admin@carapp.com
Password: Admin@123
```

---

## 📦 Dependencies

**Core:**
- expo
- react-native
- react-navigation

**Navigation:**
- @react-navigation/native
- @react-navigation/stack
- @react-navigation/bottom-tabs
- react-native-screens
- react-native-safe-area-context
- react-native-gesture-handler

**Maps:**
- react-native-maps

**API & Real-time:**
- axios
- socket.io-client

**Storage:**
- @react-native-async-storage/async-storage

---

## 🔧 Configuration

### For Physical Device Testing

1. **Find your IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   ```

2. **Update API URLs:**
   ```javascript
   // src/services/api.js
   const API_URL = 'http://192.168.1.100:5000/api';
   
   // src/services/socket.js
   const SOCKET_URL = 'http://192.168.1.100:5000';
   ```

3. **Ensure backend allows connections:**
   - Backend CORS must allow your device's origin
   - MongoDB must be accessible (use Atlas, not localhost)

---

## 🚀 Deployment

### Build APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build -p android --profile preview
```

### iOS Build

```bash
eas build -p ios --profile preview
```

### Web Build

```bash
npm run web
```

---

## 🎯 Key Features

✅ **Clean UI** - Modern, minimalist design  
✅ **Role-Based** - Shows driver tab only for approved drivers  
✅ **Real-Time** - Socket.io for live updates  
✅ **Offline Support** - AsyncStorage for token persistence  
✅ **Mock Data** - Works without Google Maps API  
✅ **Demo Mode** - Simulated payments  

---

## 🔐 Security

- JWT tokens stored in AsyncStorage
- Automatic token attachment to API requests
- 401 handling (auto-logout on token expiry)
- Secure password input fields

---

## 📝 Notes

### Demo Limitations

1. **Maps:** Using mock locations (5 NYC spots)
2. **Payments:** Simulated (no real payment gateway)
3. **Images:** Placeholder avatars
4. **Push Notifications:** Not implemented
5. **Real-Time Location:** Driver location updates via Socket.io but map doesn't show live tracking
6. **Advanced Features:** Chat, ride history, ratings UI not built (APIs exist)

### What's Working

✅ Complete authentication flow  
✅ Ride booking with fare calculation  
✅ Wallet management  
✅ Driver online/offline  
✅ Earnings dashboard  
✅ Backend integration  
✅ Socket.io connection  

---

## 🐛 Troubleshooting

**App won't connect to backend:**
- Check backend is running: http://localhost:5000
- Use IP address instead of localhost for physical devices
- Verify CORS settings in backend
- Check network (same WiFi for device and computer)

**Maps not showing:**
- Expo Go requires Maps API key in some cases
- Use emulator/simulator for better Maps support
- Or build standalone app with EAS

**Socket.io not connecting:**
- Verify SOCKET_URL matches backend
- Check backend Socket.io server is running
- Look for connection logs in console

---

## 📱 Screenshots

*(Add screenshots after testing)*

- Login Screen
- Home/Map Screen
- Wallet Screen
- Driver Dashboard
- Profile Screen

---

## 🎉 Status

**Mobile App: FUNCTIONAL PROTOTYPE ✅**

All core features working:
- ✅ Authentication
- ✅ Ride booking
- ✅ Wallet
- ✅ Driver dashboard
- ✅ Profile

Ready for:
- ✅ Local testing
- ✅ Expo Go deployment
- ✅ Backend integration testing
- ⏳ Production build (EAS)

---

**Built with ❤️ using React Native & Expo**
