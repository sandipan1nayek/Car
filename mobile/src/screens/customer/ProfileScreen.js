import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const isDriver = user?.is_driver;

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user?.phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Wallet Balance:</Text>
          <Text style={styles.infoValue}>₹{user?.wallet_balance || 0}</Text>
        </View>

        {isDriver && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Driver Status:</Text>
            <Text style={[
              styles.infoValue,
              user?.driver_status === 'online' && styles.statusOnline,
              user?.driver_status === 'on_ride' && styles.statusOnRide,
              user?.driver_status === 'offline' && styles.statusOffline
            ]}>
              {user?.driver_status === 'online' && '🟢 Online'}
              {user?.driver_status === 'on_ride' && '🔵 On Ride'}
              {user?.driver_status === 'offline' && '⚫ Offline'}
              {!user?.driver_status && '⚫ Offline'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roles</Text>
        
        <View style={styles.roleRow}>
          <Text style={styles.roleLabel}>Customer</Text>
          <Text style={styles.roleActive}>✓</Text>
        </View>

        {user?.is_driver && (
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Driver</Text>
            <Text style={styles.roleActive}>✓</Text>
          </View>
        )}

        {user?.is_manager && (
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Manager</Text>
            <Text style={styles.roleActive}>✓</Text>
          </View>
        )}

        {user?.is_admin && (
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Admin</Text>
            <Text style={styles.roleActive}>✓</Text>
          </View>
        )}
      </View>

      {/* Driver Application */}
      {!user?.is_driver && !user?.driver_application_status && !user?.is_manager && !user?.is_admin && (
        <TouchableOpacity 
          style={styles.driverApplyButton}
          onPress={() => navigation.navigate('DriverApplication')}
        >
          <Ionicons name="car-sport" size={24} color="#fff" />
          <Text style={styles.dashboardButtonText}>Apply as Driver</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Driver Application Status */}
      {user?.driver_application_status === 'pending' && (
        <View style={styles.statusCard}>
          <Ionicons name="time" size={24} color="#FF9800" />
          <Text style={styles.statusText}>Driver Application Pending Approval</Text>
        </View>
      )}

      {user?.driver_application_status === 'rejected' && (
        <View style={styles.statusCardRejected}>
          <Ionicons name="close-circle" size={24} color="#f44336" />
          <Text style={styles.statusTextRejected}>Driver Application Rejected</Text>
        </View>
      )}

      {/* Manager Dashboard Entry */}
      {user?.is_manager && (
        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('ManagerDashboard')}
        >
          <Ionicons name="shield-checkmark" size={24} color="#fff" />
          <Text style={styles.dashboardButtonText}>Open Manager Dashboard</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Admin Dashboard Entry */}
      {user?.is_admin && (
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Ionicons name="settings" size={24} color="#fff" />
          <Text style={styles.dashboardButtonText}>Open Admin Dashboard</Text>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#000',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#ccc',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  roleLabel: {
    fontSize: 16,
  },
  roleActive: {
    fontSize: 20,
    color: 'green',
  },
  dashboardButton: {
    backgroundColor: '#4CAF50',
    marginTop: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginHorizontal: 15,
  },
  adminButton: {
    backgroundColor: '#FF9800',
    marginTop: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginHorizontal: 15,
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
  driverApplyButton: {
    backgroundColor: '#2196F3',
    marginTop: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginHorizontal: 15,
  },
  statusCard: {
    backgroundColor: '#FFF3E0',
    marginTop: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  statusCardRejected: {
    backgroundColor: '#FFEBEE',
    marginTop: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  statusText: {
    color: '#E65100',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  statusTextRejected: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  statusOnline: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusOnRide: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusOffline: {
    color: '#9E9E9E',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginTop: 15,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: '600',
  },
});
