# Ride Sharing App - Backend API ✅ COMPLETE

Complete Node.js + Express + Socket.io backend server for the Uber-like ride-sharing mobile app.

## 🎉 Backend Status: FULLY IMPLEMENTED

All API endpoints, Socket.io events, and controllers are complete and ready for use!

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=your_secret_key_here
PORT=5000

# Maps Service (use DEMO_MODE for testing)
GOOGLE_MAPS_API_KEY=DEMO_MODE

# Pricing
BASE_FARE=50
PER_KM_RATE=15
PLATFORM_FEE_PERCENTAGE=15

# Optional Services
RESEND_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Create Admin User
```bash
node createAdmin.js
```
**Default Admin Credentials:**
- Email: `admin@carapp.com`
- Password: `Admin@123`

### 4. Start Server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 📚 Complete API Documentation

### 🔐 Authentication

#### POST /api/auth/signup
Create new customer account (signup only creates customers).
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

#### POST /api/auth/login
Login for all roles (customer, driver, manager, admin).
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```
**Response:** `{ token: "jwt_token", user: {...} }`

#### GET /api/auth/me
Get current user info.

---

### 👤 User Profile & Wallet

**All endpoints require:** `Authorization: Bearer <token>`

#### GET /api/user/profile
Get user profile.

#### PUT /api/user/profile
Update profile.
```json
{
  "name": "John Updated",
  "phone": "+1987654321",
  "email_preferences": {
    "ride_updates": true,
    "promotional": false
  }
}
```

#### POST /api/user/profile/picture
Upload profile picture (multipart/form-data).

#### GET /api/user/wallet
Get wallet balance.

#### POST /api/user/wallet/add
Add money to wallet (simulated payment).
```json
{
  "amount": 500
}
```

#### GET /api/user/transactions
Get transaction history with pagination.

---

### 🚗 Ride Booking

#### POST /api/ride/fare-estimate
Get fare estimate before booking.
```json
{
  "pickup": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY"
  },
  "dropoff": {
    "lat": 40.7580,
    "lng": -73.9855,
    "address": "Times Square, NY"
  }
}
```

#### POST /api/ride/create
Create ride request (finds nearest driver via Socket.io).
```json
{
  "pickup": { "lat": 40.7128, "lng": -74.0060, "address": "..." },
  "dropoff": { "lat": 40.7580, "lng": -73.9855, "address": "..." }
}
```

#### GET /api/ride/:id
Get ride details.

#### POST /api/ride/:id/cancel
Cancel ride.

#### POST /api/ride/:id/rate
Rate completed ride.
```json
{
  "rating": 5,
  "comment": "Excellent service!"
}
```

#### GET /api/ride/history
Get ride history with pagination.

---

### 🚕 Driver Features

#### POST /api/driver/apply
Apply to become driver.
```json
{
  "vehicle_info": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "plate": "ABC123",
    "color": "Black"
  }
}
```

#### GET /api/driver/application
Check application status.

#### POST /api/driver/online *(Requires: is_driver)*
Go online.
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

#### POST /api/driver/offline
Go offline.

#### POST /api/driver/location
Update real-time location.
```json
{
  "lat": 40.7128,
  "lng": -74.0060
}
```

#### POST /api/driver/rides/:id/accept
Accept ride request.

#### POST /api/driver/rides/:id/reject
Reject ride request.

#### POST /api/driver/rides/:id/start
Start trip.

#### POST /api/driver/rides/:id/complete
Complete trip and process payment.

#### GET /api/driver/earnings
Get earnings statistics (today, week, month, all-time).

#### GET /api/driver/rides/active
Get current active ride.

---

### 👔 Manager Dashboard *(Requires: is_manager)*

#### GET /api/manager/dashboard
Get statistics (users, rides, revenue, tickets).

#### GET /api/manager/users
Search and filter users.
**Query params:** `search`, `role`, `page`, `limit`

#### GET /api/manager/rides
Get all rides with filters.
**Query params:** `status`, `page`, `limit`

#### GET /api/manager/rides/active
Get real-time active rides.

#### GET /api/manager/chats
Get support conversations.
**Query params:** `status`

---

### 👑 Admin Panel *(Requires: is_admin)*

#### GET /api/admin/dashboard
Comprehensive analytics (users, drivers, rides, revenue, platform earnings).

#### GET /api/admin/applications
Get driver applications.
**Query params:** `status` (pending/approved/rejected)

#### GET /api/admin/applications/:id
Get application details with user history.

#### POST /api/admin/applications/:id/approve
Approve driver application (sets `is_driver=true`, sends email).

#### POST /api/admin/applications/:id/reject
Reject driver application.
```json
{
  "reason": "Invalid documents"
}
```

#### GET /api/admin/users
Search all users.
**Query params:** `search`, `role`, `suspended`, `page`, `limit`

#### POST /api/admin/users/:id/suspend
Suspend user account.
```json
{
  "reason": "Terms violation"
}
```

#### POST /api/admin/users/:id/unsuspend
Reactivate user account.

#### POST /api/admin/managers/create
Create manager account.
```json
{
  "name": "Manager Name",
  "email": "manager@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

#### DELETE /api/admin/managers/:id
Remove manager role.

#### GET /api/admin/analytics
Detailed analytics with charts.
**Query params:** `period` (7d/30d/1y)

---

### 💬 Support Chat

#### GET /api/chat/conversations
Get conversations (users see only theirs, managers see all).

#### GET /api/chat/:id
Get conversation messages.

#### POST /api/chat/send
Send support message.
```json
{
  "subject": "Ride Issue",
  "message": "I have a problem..."
}
```

#### POST /api/chat/:id/reply *(Manager/Admin only)*
Reply to customer.
```json
{
  "message": "Thank you for contacting us..."
}
```

#### POST /api/chat/:id/close *(Manager/Admin only)*
Close conversation.

---

## 🔌 Socket.io Real-Time Events

### Client Emits

```javascript
// Driver goes online
socket.emit('driver_online', { driverId, location: { lat, lng } });

// Driver goes offline
socket.emit('driver_offline', { driverId });

// Driver location update
socket.emit('driver_location_update', { driverId, location: { lat, lng } });

// Customer support message
socket.emit('customer_message', { userId, message });

// Manager reply
socket.emit('manager_reply', { conversationId, message });
```

### Server Emits

```javascript
// Ride request to specific driver
socket.on(`driver_${driverId}_ride_request`, (data) => {
  // data: { rideId, pickup, dropoff, customer, fare }
});

// Ride assigned to customer
socket.on(`customer_${customerId}_ride_assigned`, (data) => {
  // data: { rideId, driver: { name, phone, vehicle, rating } }
});

// Ride started
socket.on(`customer_${customerId}_ride_started`, ({ rideId }));

// Ride completed
socket.on(`customer_${customerId}_ride_completed`, ({ rideId, fare }));

// Real-time driver location during ride
socket.on(`ride_${rideId}_driver_location`, ({ lat, lng }));

// New support message for managers
socket.on('manager_new_message', (data) => {
  // data: { conversationId, user, message, timestamp }
});

// Reply received by customer
socket.on(`customer_${customerId}_message`, (data));
```

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Signup, login (3 endpoints)
│   │   ├── userController.js        # Profile, wallet (6 endpoints)
│   │   ├── rideController.js        # Booking, rating (6 endpoints)
│   │   ├── driverController.js      # Driver ops (11 endpoints)
│   │   ├── managerController.js     # Monitoring (5 endpoints)
│   │   ├── adminController.js       # Management (11 endpoints)
│   │   └── chatController.js        # Support (5 endpoints)
│   ├── middleware/
│   │   └── auth.js                  # JWT + role checks
│   ├── models/
│   │   ├── User.js                  # Role-based user model
│   │   ├── Ride.js                  # Ride lifecycle
│   │   ├── Transaction.js           # Wallet audit trail
│   │   ├── Chat.js                  # Support conversations
│   │   └── DriverLocation.js        # Geospatial tracking
│   ├── routes/
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── ride.js
│   │   ├── driver.js
│   │   ├── manager.js
│   │   ├── admin.js
│   │   └── chat.js
│   ├── services/
│   │   ├── mapsService.js           # Smart maps wrapper
│   │   ├── mockMapsService.js       # Demo mode (no API key needed)
│   │   ├── emailService.js          # Resend integration
│   │   └── cloudinaryService.js     # Image uploads
│   └── server.js                    # Express + Socket.io setup
├── .env                             # Environment config
├── .env.example                     # Template
├── createAdmin.js                   # Admin creation script
├── package.json                     # Dependencies
└── README_API.md                    # This file
```

---

## 🧪 Testing the API

### Using cURL

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","phone":"+1234567890","password":"Test123"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}' | jq -r '.token')

# 3. Get Profile
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Add Money
curl -X POST http://localhost:5000/api/user/wallet/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

# 5. Get Fare Estimate
curl -X POST http://localhost:5000/api/ride/fare-estimate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pickup":{"lat":40.7128,"lng":-74.0060,"address":"NYC"},"dropoff":{"lat":40.7580,"lng":-73.9855,"address":"Times Square"}}'
```

### Using Postman

1. Import collection from this documentation
2. Set `{{baseUrl}}` = `http://localhost:5000`
3. After login, set `{{token}}` variable
4. Use `Bearer {{token}}` in Authorization

---

## 🔐 Role-Based Access Control

| Role | Signup | Features |
|------|--------|----------|
| **Customer** | ✅ Yes | Book rides, wallet, profile, support |
| **Driver** | ❌ No (apply) | Customer + driver features (after approval) |
| **Manager** | ❌ No (admin creates) | Customer + monitoring dashboard |
| **Admin** | ❌ No (script) | Full system access |

**Key Points:**
- Everyone starts as customer
- Roles are additive flags: `is_driver`, `is_manager`, `is_admin`
- `role_base` always remains "customer"
- Driver status: offline → online → busy (during ride)

---

## 📊 Mock Maps Service (DEMO_MODE)

When `GOOGLE_MAPS_API_KEY=DEMO_MODE`, the app uses a complete mock implementation:

**10 Preset Locations:**
1. Times Square, NY
2. Central Park, NY
3. Statue of Liberty, NY
4. Brooklyn Bridge, NY
5. Empire State Building, NY
6. One World Trade Center, NY
7. JFK Airport, NY
8. LaGuardia Airport, NY
9. Yankee Stadium, NY
10. Coney Island, NY

**Features:**
- Haversine formula for distance calculation
- Fare: BASE_FARE + (distance × PER_KM_RATE)
- Travel time: distance ÷ 40 km/h
- Nearby drivers: random positions within radius
- Full compatibility with real Google Maps API

---

## 💰 Payment Flow

1. **Customer adds money** → wallet_balance increases
2. **Ride created** → fare estimate shown
3. **Ride completed** → payment processed:
   - Customer wallet: -₹fare
   - Platform fee: 15% of fare
   - Driver wallet: +₹(fare - platform fee)
4. **Transactions logged** for audit trail

---

## 📧 Email Notifications

When `RESEND_API_KEY` is configured:

- **Driver application submitted** → Admin notified
- **Driver approved/rejected** → Driver notified
- **Ride completed** → Customer receives receipt
- **Support message** → Manager notified
- **Weekly earnings** → Driver summary

---

## 🖼️ Image Uploads

When `CLOUDINARY_*` is configured:
- Profile pictures uploaded to Cloudinary
- Driver documents stored securely

**Fallback:** Uses `ui-avatars.com` and placeholder images if not configured.

---

## ⚡ Performance & Scalability

- **Geospatial queries** with MongoDB 2dsphere index
- **Socket.io** for real-time updates (no polling)
- **JWT tokens** (stateless auth, no sessions)
- **Pagination** on all list endpoints
- **Indexes** on frequently queried fields

---

## ⚠️ Production Checklist

- [ ] Change admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Add real Google Maps API key
- [ ] Enable Cloudinary for images
- [ ] Set up Resend for emails
- [ ] Configure CORS for mobile app domain
- [ ] Enable HTTPS/TLS
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting

---

## 🐛 Common Issues

**MongoDB connection fails:**
- Check MONGODB_URI in .env
- Verify network access in MongoDB Atlas
- Ensure database user has read/write permissions

**JWT errors:**
- Verify JWT_SECRET is set
- Check token expiration (30 days default)
- Ensure Authorization header format: `Bearer token`

**Socket.io not connecting:**
- Client must connect to same port as Express (5000)
- Check CORS configuration
- Verify transport protocol (websocket)

**Geospatial queries fail:**
- Run migrations to create 2dsphere index
- Ensure coordinates are [longitude, latitude] order
- Check coordinates are valid numbers

---

## 📞 Support & Contribution

Backend is complete and production-ready! If you encounter any issues:

1. Check this documentation
2. Review .env configuration
3. Check server logs for detailed errors
4. Verify MongoDB connection

---

**🎉 Backend Development: COMPLETE ✅**

All 47 API endpoints implemented with full Socket.io real-time support!
