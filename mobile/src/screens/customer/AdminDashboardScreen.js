import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingDrivers();
  }, []);

  const loadPendingDrivers = async () => {
    try {
      const response = await adminAPI.getPendingDrivers();
      console.log('===== PENDING DRIVERS RESPONSE =====');
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('First driver:', response.drivers?.[0]);
      console.log('First driver _id:', response.drivers?.[0]?._id);
      setPendingDrivers(response.drivers || []);
    } catch (error) {
      console.error('Error loading pending drivers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (driverId, driverName) => {
    Alert.alert(
      'Approve Driver',
      `Are you sure you want to approve ${driverName} as a driver?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              console.log('===== APPROVING DRIVER =====');
              console.log('Driver ID:', driverId);
              console.log('Driver Name:', driverName);
              console.log('Type of driverId:', typeof driverId);
              
              const result = await adminAPI.approveDriver(driverId);
              console.log('Approval result:', result);
              
              Alert.alert('Success', 'Driver approved successfully');
              loadPendingDrivers();
            } catch (error) {
              console.error('Approval error:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              Alert.alert('Error', error.error || error.message || 'Failed to approve driver');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (driverId, driverName) => {
    Alert.alert(
      'Reject Driver',
      `Are you sure you want to reject ${driverName}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.rejectDriver(driverId);
              Alert.alert('Success', 'Driver application rejected');
              loadPendingDrivers();
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to reject driver');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingDrivers();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>{user?.name}</Text>
        </View>
      </View>

      {/* Driver Applications Queue */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sectionHeader}>
          <Ionicons name="car" size={24} color="#FF9800" />
          <Text style={styles.sectionTitle}>Pending Driver Applications</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingDrivers.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF9800" style={{ marginTop: 50 }} />
        ) : pendingDrivers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No pending applications</Text>
          </View>
        ) : (
          pendingDrivers.map((driver) => (
            <View key={driver._id} style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {driver.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverInfo}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <Text style={styles.driverEmail}>{driver.email}</Text>
                  <Text style={styles.driverPhone}>{driver.phone}</Text>
                </View>
              </View>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>Vehicle Information</Text>
                <Text style={styles.vehicleText}>
                  {driver.vehicle_info?.make} {driver.vehicle_info?.model} ({driver.vehicle_info?.year})
                </Text>
                <Text style={styles.vehicleText}>
                  Plate: {driver.vehicle_info?.plate} • Color: {driver.vehicle_info?.color}
                </Text>
                <Text style={styles.vehicleText}>
                  License: {driver.driver_documents?.license}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleReject(driver._id, driver.name)}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprove(driver._id, driver.name)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF9800',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  driverAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  driverPhone: {
    fontSize: 14,
    color: '#666',
  },
  vehicleInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
