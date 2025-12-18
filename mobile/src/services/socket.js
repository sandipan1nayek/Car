import io from 'socket.io-client';

// Change this to match your backend URL
const SOCKET_URL = 'http://192.168.0.18:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper functions for common events
export const socketEmit = (event, data) => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
};

export const socketOn = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
  }
};

export const socketOff = (event) => {
  if (socket) {
    socket.off(event);
  }
};
