# Ride Sharing App - Backend

Backend API server for the ride-sharing mobile application.

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB Atlas account
- API keys (Google Maps, Resend, Cloudinary)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
Copy `.env.example` to `.env` and add your credentials:
```bash
cp .env.example .env
```

Edit `.env` and add:
- MongoDB connection string
- Google Maps API key
- Resend API key (for emails)
- Cloudinary credentials (for image uploads)

3. Start the server:
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new customer
- `POST /api/auth/login` - Login (all roles)
- `GET /api/auth/me` - Get current user

### User (Customer)
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/wallet` - Get wallet balance
- `POST /api/user/wallet/add` - Add money
- `GET /api/user/transactions` - Transaction history

### Rides
- `POST /api/rides/create` - Create ride request
- `GET /api/rides/fare-estimate` - Calculate fare
- `POST /api/rides/:id/cancel` - Cancel ride
- `GET /api/rides/:id` - Get ride details
- `POST /api/rides/:id/rate` - Rate ride

### Driver (requires is_driver=true)
- `POST /api/driver/apply` - Apply to become driver
- `GET /api/driver/application` - Get application status
- `POST /api/driver/online` - Go online
- `POST /api/driver/offline` - Go offline
- `POST /api/driver/rides/:id/accept` - Accept ride
- `POST /api/driver/rides/:id/start` - Start trip
- `POST /api/driver/rides/:id/complete` - Complete trip
- `GET /api/driver/earnings` - Get earnings

### Manager (requires is_manager=true)
- `GET /api/manager/dashboard` - Dashboard stats
- `GET /api/manager/users` - Get all users
- `GET /api/manager/rides` - Get all rides
- `GET /api/manager/rides/active` - Get active rides

### Admin (requires is_admin=true)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/driver-applications` - Get applications
- `POST /api/admin/driver-applications/:id/approve` - Approve driver
- `POST /api/admin/driver-applications/:id/reject` - Reject driver
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/suspend` - Suspend user
- `POST /api/admin/managers/create` - Create manager

### Chat
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/send` - Send message

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Request handlers
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js             # Authentication & role checks
│   ├── models/                 # Database schemas
│   │   ├── User.js
│   │   ├── Ride.js
│   │   ├── Transaction.js
│   │   ├── Chat.js
│   │   └── DriverLocation.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── user.js
│   │   ├── ride.js
│   │   ├── driver.js
│   │   ├── manager.js
│   │   ├── admin.js
│   │   └── chat.js
│   ├── services/               # External services
│   │   ├── emailService.js     # Resend email
│   │   └── cloudinaryService.js # Image uploads
│   └── server.js               # Main entry point
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
└── package.json
```

## 🌐 Socket.io Events

### Client → Server
- `driver_online` - Driver goes online
- `driver_offline` - Driver goes offline
- `driver_location_update` - Driver location update
- `customer_message` - Customer sends chat message
- `manager_reply` - Manager replies to chat

### Server → Client
- `ride_request` - New ride request to driver
- `ride_{rideId}_driver_location` - Driver location to customer
- `new_support_message` - New chat to managers
- `customer_{customerId}_message` - Manager reply to customer

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:5000/health
```

## 🚀 Deployment

### Render.com (Free Tier)
1. Create account on Render.com
2. New Web Service → Connect GitHub repo
3. Set environment variables in Render dashboard
4. Deploy!

### Environment Variables on Render
Add all variables from `.env` file in Render dashboard.

## 📝 Notes

- MongoDB connection will fail without valid connection string
- Cloudinary is optional for demo (images won't upload)
- Resend is optional for demo (emails won't send)
- Server runs on port 5000 by default
- Socket.io runs on same port as HTTP server

## 🐛 Troubleshooting

**MongoDB connection error?**
- Check your connection string in `.env`
- Make sure IP is whitelisted in MongoDB Atlas

**Port already in use?**
- Change PORT in `.env` file

**Module not found?**
- Run `npm install` again

## 👤 Creating Manager/Admin Accounts

Manager and admin accounts cannot be created via signup. Use MongoDB directly or this script:

```javascript
// Add to User model in database
{
  name: "Admin User",
  email: "admin@app.com",
  password: "hashed_password", // Use bcrypt
  role_base: "customer",
  is_admin: true,
  is_manager: false,
  is_driver: false
}
```

I'll provide a helper script for this later.
