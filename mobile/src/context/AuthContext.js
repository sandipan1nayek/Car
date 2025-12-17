import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setToken(storedToken);
        const userData = await authAPI.getMe();
        setUser(userData.user);
        initializeSocket(storedToken);
      }
    } catch (error) {
      console.error('Load user error:', error);
      await AsyncStorage.removeItem('userToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      await AsyncStorage.setItem('userToken', response.token);
      setToken(response.token);
      setUser(response.user);
      initializeSocket(response.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Login failed' };
    }
  };

  const signup = async (name, email, phone, password) => {
    try {
      const response = await authAPI.signup({ name, email, phone, password });
      await AsyncStorage.setItem('userToken', response.token);
      setToken(response.token);
      setUser(response.user);
      initializeSocket(response.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.error || 'Signup failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    disconnectSocket();
    setUser(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        updateUser,
        isDriver: user?.is_driver || false,
        isManager: user?.is_manager || false,
        isAdmin: user?.is_admin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
