require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const { configureCloudinary } = require('./services/cloudinaryService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const rideRoutes = require('./routes/ride');
const driverRoutes = require('./routes/driver');
const managerRoutes = require('./routes/manager');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io available to routes
app.set('io', io);

// Connect to database
connectDB();

// Configure Cloudinary
configureCloudinary();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Ride Sharing API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      rides: '/api/rides',
      driver: '/api/driver',
      manager: '/api/manager',
      admin: '/api/admin',
      chat: '/api/chat'
    }
  });
});

// Socket.io connection handling
const onlineDrivers = new Map(); // Map<userId, socketId>

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // Driver goes online
  socket.on('driver_online', (data) => {
    const { userId } = data;
    onlineDrivers.set(userId, socket.id);
    console.log(`🚗 Driver ${userId} is online`);
  });
  
  // Driver goes offline
  socket.on('driver_offline', (data) => {
    const { userId } = data;
    onlineDrivers.delete(userId);
    console.log(`🚗 Driver ${userId} went offline`);
  });
  
  // Driver location update
  socket.on('driver_location_update', (data) => {
    const { userId, lat, lng, rideId } = data;
    if (rideId) {
      // Broadcast to customer in this ride
      io.emit(`ride_${rideId}_driver_location`, { lat, lng });
    }
  });
  
  // Chat message from customer
  socket.on('customer_message', (data) => {
    // Broadcast to all managers
    io.emit('new_support_message', data);
  });
  
  // Chat reply from manager
  socket.on('manager_reply', (data) => {
    const { customerId, message } = data;
    // Send to specific customer
    io.emit(`customer_${customerId}_message`, message);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    // Remove from online drivers if was a driver
    for (const [userId, socketId] of onlineDrivers.entries()) {
      if (socketId === socket.id) {
        onlineDrivers.delete(userId);
        console.log(`🚗 Driver ${userId} disconnected`);
        break;
      }
    }
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make online drivers available globally
global.onlineDrivers = onlineDrivers;
global.io = io;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };
