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
  const [selectedSection, setSelectedSection] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedSection === 'drivers') {
      loadData();
    }
  }, [selectedSection]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load pending drivers
      const pendingResponse = await adminAPI.getPendingDrivers();
      setPendingDrivers(pendingResponse.drivers || []);

      // Load approved drivers
      const approvedResponse = await adminAPI.getApprovedDrivers();
      setApprovedDrivers(approvedResponse.drivers || []);
    } catch (error) {
      console.error('Error loading data:', error);
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
              loadData();
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
              loadData();
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
    loadData();
  };

  const getSectionTitle = (id) => {
    const sections = {
      'drivers': 'Driver Management',
      'users': 'User Management',
      'managers': 'Manager Management',
      'rides': 'Ride Monitoring',
      'analytics': 'Analytics & Reports',
      'transactions': 'Transactions',
    };
    return sections[id] || 'Admin Dashboard';
  };

  const adminSections = [
    {
      id: 'drivers',
      title: 'Driver Management',
      subtitle: 'Approve applications & manage drivers',
      icon: 'car',
      color: '#FF9800',
      badge: pendingDrivers.length,
    },
    {
      id: 'users',
      title: 'User Management',
      subtitle: 'View and manage all users',
      icon: 'people',
      color: '#2196F3',
    },
    {
      id: 'managers',
      title: 'Manager Management',
      subtitle: 'Create and manage managers',
      icon: 'shield-checkmark',
      color: '#4CAF50',
    },
    {
      id: 'rides',
      title: 'Ride Monitoring',
      subtitle: 'View all rides and statistics',
      icon: 'car-sport',
      color: '#9C27B0',
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      subtitle: 'View system analytics',
      icon: 'bar-chart',
      color: '#00BCD4',
    },
    {
      id: 'transactions',
      title: 'Transactions',
      subtitle: 'Monitor all transactions',
      icon: 'cash',
      color: '#FF5722',
    },
  ];

  const renderMainDashboard = () => (
    <ScrollView 
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
        }} />
      }
    >
      <Text style={styles.welcomeText}>Welcome, Admin!</Text>
      <Text style={styles.descriptionText}>
        Select a section below to manage your application
      </Text>

      <View style={styles.cardsContainer}>
        {adminSections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.sectionCard}
            onPress={() => setSelectedSection(section.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: section.color }]}>
              <Ionicons name={section.icon} size={32} color="#fff" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{section.title}</Text>
              <Text style={styles.cardSubtitle}>{section.subtitle}</Text>
            </View>
            {section.badge > 0 && (
              <View style={[styles.cardBadge, { backgroundColor: section.color }]}>
                <Text style={styles.cardBadgeText}>{section.badge}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderDriverManagement = () => (
    <>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Ionicons 
            name="time" 
            size={20} 
            color={activeTab === 'pending' ? '#FF9800' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
          {pendingDrivers.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingDrivers.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={activeTab === 'approved' ? '#FF9800' : '#999'} 
          />
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
            Approved
          </Text>
          {approvedDrivers.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{approvedDrivers.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FF9800" style={{ marginTop: 50 }} />
        ) : activeTab === 'pending' ? (
          // Pending Drivers Tab
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="car" size={24} color="#FF9800" />
              <Text style={styles.sectionTitle}>Pending Driver Applications</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingDrivers.length}</Text>
              </View>
            </View>

            {pendingDrivers.length === 0 ? (
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
          </>
        ) : (
          // Approved Drivers Tab
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="car-sport" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Approved Drivers</Text>
              <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.badgeText}>{approvedDrivers.length}</Text>
              </View>
            </View>

            {approvedDrivers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No approved drivers yet</Text>
              </View>
            ) : (
              approvedDrivers.map((driver) => (
                <View key={driver._id} style={styles.driverCard}>
                  <View style={styles.driverHeader}>
                    <View style={[styles.driverAvatar, { backgroundColor: '#4CAF50' }]}>
                      <Text style={styles.driverAvatarText}>
                        {driver.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.driverInfo}>
                      <Text style={styles.driverName}>{driver.name}</Text>
                      <Text style={styles.driverEmail}>{driver.email}</Text>
                      <Text style={styles.driverPhone}>{driver.phone}</Text>
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, getStatusColor(driver.driver_status)]}>
                          <Text style={styles.statusText}>
                            {getStatusIcon(driver.driver_status)} {driver.driver_status?.toUpperCase()}
                          </Text>
                        </View>
                        {driver.is_dummy && (
                          <View style={[styles.statusBadge, { backgroundColor: '#9C27B0' }]}>
                            <Text style={styles.statusText}>DUMMY</Text>
                          </View>
                        )}
                      </View>
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

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{driver.total_rides_completed || 0}</Text>
                      <Text style={styles.statLabel}>Rides</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>₹{driver.wallet_balance || 0}</Text>
                      <Text style={styles.statLabel}>Balance</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {driver.driver_rating ? driver.driver_rating.toFixed(1) : 'N/A'}
                      </Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </>
  );

  const renderComingSoon = (title) => (
    <View style={styles.comingSoonContainer}>
      <Ionicons name="construct" size={64} color="#ccc" />
      <Text style={styles.comingSoonTitle}>{title}</Text>
      <Text style={styles.comingSoonText}>This feature is coming soon!</Text>
      <TouchableOpacity
        style={styles.backToMainButton}
        onPress={() => setSelectedSection(null)}
      >
        <Ionicons name="arrow-back" size={20} color="#FF9800" />
        <Text style={styles.backToMainText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (selectedSection) {
              setSelectedSection(null);
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {selectedSection ? getSectionTitle(selectedSection) : 'Admin Dashboard'}
          </Text>
          <Text style={styles.headerSubtitle}>{user?.name}</Text>
        </View>
      </View>

      {/* Render Content Based on Selection */}
      {!selectedSection && renderMainDashboard()}
      {selectedSection === 'drivers' && renderDriverManagement()}
      {selectedSection === 'users' && renderComingSoon('User Management')}
      {selectedSection === 'managers' && renderComingSoon('Manager Management')}
      {selectedSection === 'rides' && renderComingSoon('Ride Monitoring')}
      {selectedSection === 'analytics' && renderComingSoon('Analytics & Reports')}
      {selectedSection === 'transactions' && renderComingSoon('Transactions')}
    </View>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return { backgroundColor: '#4CAF50' };
    case 'on_ride':
      return { backgroundColor: '#2196F3' };
    case 'offline':
      return { backgroundColor: '#757575' };
    default:
      return { backgroundColor: '#999' };
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'online':
      return '🟢';
    case 'on_ride':
      return '🔵';
    case 'offline':
      return '⚫';
    default:
      return '⚪';
  }
};

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF9800',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  cardsContainer: {
    gap: 15,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  cardBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  backToMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  backToMainText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
