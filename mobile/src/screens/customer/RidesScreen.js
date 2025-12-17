import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { rideAPI } from '../../services/api';

export default function RidesScreen() {
  const [activeRides, setActiveRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history

  useFocusEffect(
    React.useCallback(() => {
      loadRides();
    }, [])
  );

  const loadRides = async () => {
    setLoading(true);
    try {
      const response = await rideAPI.getHistory();
      const history = response.rides || response || [];
      
      // Separate active and completed rides
      const active = Array.isArray(history) ? history.filter(ride => 
        ['requested', 'assigned', 'en_route'].includes(ride.status)
      ) : [];
      const completed = Array.isArray(history) ? history.filter(ride => 
        ['completed', 'cancelled'].includes(ride.status)
      ) : [];
      
      setActiveRides(active);
      setRideHistory(completed);
    } catch (error) {
      console.error('Load rides error:', error);
      setActiveRides([]);
      setRideHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Dummy driver data for active rides
  const getDummyDriver = () => ({
    name: 'John Smith',
    phone: '+91 98765 43210',
    rating: 4.8,
    vehicle: 'Honda City - MH 02 AB 1234',
    photo: `https://ui-avatars.com/api/?name=John+Smith&size=200&background=random`,
  });

  const getStatusColor = (status) => {
    const colors = {
      requested: '#FF9800',
      assigned: '#2196F3',
      en_route: '#4CAF50',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      requested: 'Finding Driver',
      assigned: 'Driver Assigned',
      en_route: 'On the Way',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeRides.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({rideHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRides} />
        }
      >
        {activeTab === 'active' && (
          <>
            {activeRides.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No Active Rides</Text>
                <Text style={styles.emptySubtext}>Book a ride to get started</Text>
              </View>
            ) : (
              activeRides.map((ride) => {
                const driver = getDummyDriver();
                return (
                  <View key={ride._id} style={styles.rideCard}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
                    </View>

                    {/* Driver Info */}
                    {ride.status !== 'requested' && (
                      <View style={styles.driverSection}>
                        <Image source={{ uri: driver.photo }} style={styles.driverPhoto} />
                        <View style={styles.driverInfo}>
                          <Text style={styles.driverName}>{driver.name}</Text>
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.rating}>{driver.rating}</Text>
                          </View>
                          <Text style={styles.vehicleInfo}>{driver.vehicle}</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton}>
                          <Ionicons name="call" size={24} color="#4CAF50" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Route Info */}
                    <View style={styles.routeSection}>
                      <View style={styles.routeRow}>
                        <Ionicons name="ellipse" size={12} color="#4CAF50" />
                        <View style={styles.routeText}>
                          <Text style={styles.locationLabel}>Pickup</Text>
                          <Text style={styles.locationAddress}>{ride.pickup.address}</Text>
                        </View>
                      </View>
                      <View style={styles.routeLine} />
                      <View style={styles.routeRow}>
                        <Ionicons name="location" size={12} color="#F44336" />
                        <View style={styles.routeText}>
                          <Text style={styles.locationLabel}>Drop-off</Text>
                          <Text style={styles.locationAddress}>{ride.dropoff.address}</Text>
                        </View>
                      </View>
                    </View>

                    {/* Ride Details */}
                    <View style={styles.detailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{ride.estimated_duration_min} min</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="navigate-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{ride.distance_km} km</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="wallet-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>₹{ride.fare_estimated}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {rideHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No Ride History</Text>
                <Text style={styles.emptySubtext}>Your completed rides will appear here</Text>
              </View>
            ) : (
              rideHistory.map((ride) => (
                <View key={ride._id} style={styles.historyCard}>
                  {/* Date */}
                  <Text style={styles.historyDate}>{formatDate(ride.createdAt)}</Text>

                  {/* Route */}
                  <View style={styles.historyRoute}>
                    <View style={styles.routeRow}>
                      <Ionicons name="ellipse" size={10} color="#4CAF50" />
                      <Text style={styles.historyLocation}>{ride.pickup.address}</Text>
                    </View>
                    <View style={styles.routeRow}>
                      <Ionicons name="location" size={10} color="#F44336" />
                      <Text style={styles.historyLocation}>{ride.dropoff.address}</Text>
                    </View>
                  </View>

                  {/* Details Row */}
                  <View style={styles.historyDetailsRow}>
                    <View style={[styles.historyStatus, { backgroundColor: getStatusColor(ride.status) + '20' }]}>
                      <Text style={[styles.historyStatusText, { color: getStatusColor(ride.status) }]}>
                        {getStatusText(ride.status)}
                      </Text>
                    </View>
                    <Text style={styles.historyFare}>₹{ride.fare_estimated || ride.fare_final}</Text>
                  </View>
                </View>
              ))
            )}
          </>
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 15,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#666',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeSection: {
    marginBottom: 15,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
    marginVertical: 5,
  },
  routeText: {
    marginLeft: 10,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  historyRoute: {
    marginBottom: 12,
  },
  historyLocation: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 5,
  },
  historyDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  historyStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyFare: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
