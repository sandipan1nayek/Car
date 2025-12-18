import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { rideAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function RidesScreen() {
  const { updateUser } = useAuth();
  const [activeRides, setActiveRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadRides();
      
      // Set up interval to check for late rides and update arriving time
      const interval = setInterval(() => {
        loadRides();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
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

  const getArrivingTime = (ride) => {
    const now = new Date();
    const createdAt = new Date(ride.createdAt);
    
    // Calculate arriving time based on booking type
    let arrivingTime;
    if (ride.scheduled_time) {
      // For scheduled rides: driver arrives at scheduled time (not 5 mins before)
      arrivingTime = new Date(ride.scheduled_time);
    } else {
      // For "now" bookings: driver arrives 5 minutes after booking
      arrivingTime = new Date(createdAt.getTime() + 5 * 60 * 1000);
    }
    
    const diffMs = arrivingTime - now;
    const diffMins = Math.ceil(diffMs / 60000);
    
    if (diffMins <= 0) {
      return 'Driver Arrived';
    } else if (diffMins === 1) {
      return '1 min';
    } else if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    } else {
      return `${diffMins} mins`;
    }
  };

  const checkIfDriverLate = (ride) => {
    const now = new Date();
    const createdAt = new Date(ride.createdAt);
    
    let arrivingTime;
    if (ride.scheduled_time) {
      arrivingTime = new Date(ride.scheduled_time);
    } else {
      arrivingTime = new Date(createdAt.getTime() + 5 * 60 * 1000);
    }
    
    const diffMs = now - arrivingTime;
    const diffMins = diffMs / 60000;
    
    // Driver is late if more than 2 minutes past arriving time
    return diffMins >= 2;
  };

  const handleDriverLate = async (ride, action) => {
    if (action === 'wait') {
      Alert.alert('Notification Sent', 'We have notified the driver. Thank you for your patience.');
    } else if (action === 'cancel') {
      Alert.alert(
        'Cancel Ride',
        'You will receive 100% refund as the driver is late. Would you like to submit feedback?',
        [
          { text: 'Cancel Without Feedback', onPress: async () => {
            try {
              await rideAPI.cancelRide(ride._id, true); // true = driver_late
              const userData = await authAPI.getMe();
              updateUser(userData.user);
              loadRides();
              Alert.alert('Success', 'Ride cancelled. Full refund credited to your wallet.');
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to cancel ride');
            }
          }},
          { text: 'Cancel & Give Feedback', onPress: async () => {
            try {
              await rideAPI.cancelRide(ride._id, true); // true = driver_late
              const userData = await authAPI.getMe();
              updateUser(userData.user);
              setSelectedRide(ride);
              setShowFeedbackModal(true);
              loadRides();
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to cancel ride');
            }
          }},
        ]
      );
    }
  };

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

  const cancelRide = (ride) => {
    const penalty = Math.round(ride.fare_estimated * 0.4);
    const refund = ride.fare_estimated - penalty;
    
    Alert.alert(
      'Cancel Ride',
      `Cancellation fee: ₹${penalty} (40%)\nRefund amount: ₹${refund}\n\nAre you sure you want to cancel?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await rideAPI.cancelRide(ride._id);
              const userData = await authAPI.getMe();
              updateUser(userData.user);
              loadRides();
              Alert.alert('Success', `Ride cancelled. ₹${refund} refunded to wallet.`);
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to cancel ride');
            }
          },
        },
      ]
    );
  };

  const confirmPickup = (ride) => {
    setSelectedRide(ride);
    setShowPickupModal(true);
  };

  const handlePickupConfirmed = async () => {
    if (!selectedRide) return;
    
    try {
      setShowPickupModal(false);
      
      // Call API to start trip
      await rideAPI.startTrip(selectedRide._id);
      Alert.alert('Ride Started', 'Your ride is now in progress. Enjoy your journey!');
      
      // Simulate ride completion after 5 seconds (for demo)
      setTimeout(async () => {
        try {
          await rideAPI.completeTrip(selectedRide._id);
          loadRides(); // Refresh to get updated status
          setShowFeedbackModal(true);
        } catch (error) {
          console.error('Complete trip error:', error);
        }
      }, 5000);
      
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to start trip');
    }
  };

  const submitFeedback = async () => {
    if (!selectedRide) return;
    
    try {
      await rideAPI.rateRide(selectedRide._id, rating, comment);
      const userData = await authAPI.getMe();
      updateUser(userData.user);
      setShowFeedbackModal(false);
      setRating(5);
      setComment('');
      setSelectedRide(null);
      loadRides();
      Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to submit feedback');
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all completed and cancelled rides? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await rideAPI.clearHistory();
              loadRides();
              Alert.alert('Success', `${response.deletedCount} ride(s) cleared from history.`);
            } catch (error) {
              Alert.alert('Error', error.error || 'Failed to clear history');
            }
          },
        },
      ]
    );
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
                // Use actual driver data from API response, fallback to dummy if not assigned
                const actualDriver = ride.driver;
                console.log('Ride ID:', ride._id, 'Driver:', actualDriver ? actualDriver.name : 'NO DRIVER');
                const driverName = actualDriver?.name || 'Finding driver...';
                const driverPhoto = actualDriver?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(driverName)}&size=200&background=random`;
                const driverRating = actualDriver?.driver_rating || 5.0;
                const vehicleInfo = actualDriver?.vehicle_info 
                  ? `${actualDriver.vehicle_info.make} ${actualDriver.vehicle_info.model} • ${actualDriver.vehicle_info.plate}`
                  : 'Vehicle info not available';
                
                return (
                  <View key={ride._id} style={styles.rideCard}>
                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
                    </View>

                    {/* Driver Info */}
                    {ride.status !== 'requested' && (
                      <View style={styles.driverSection}>
                        <Image source={{ uri: driverPhoto }} style={styles.driverPhoto} />
                        <View style={styles.driverInfo}>
                          <Text style={styles.driverName}>{driverName}</Text>
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={styles.rating}>{driverRating.toFixed(1)}</Text>
                          </View>
                          <Text style={styles.vehicleInfo}>{vehicleInfo}</Text>
                          {ride.status === 'assigned' && (
                            <View style={styles.arrivingTimeContainer}>
                              <Ionicons name="time-outline" size={14} color="#4CAF50" />
                              <Text style={styles.arrivingTime}>Arriving in {getArrivingTime(ride)}</Text>
                            </View>
                          )}
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

                    {/* Driver Late Buttons - Show if driver is late */}
                    {ride.status === 'assigned' && checkIfDriverLate(ride) && (
                      <View style={styles.driverLateContainer}>
                        <Text style={styles.driverLateText}>⚠️ Driver is running late</Text>
                        <View style={styles.driverLateButtons}>
                          <TouchableOpacity 
                            style={styles.waitButton}
                            onPress={() => handleDriverLate(ride, 'wait')}
                          >
                            <Text style={styles.waitButtonText}>I'll Wait</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.cancelLateButton}
                            onPress={() => handleDriverLate(ride, 'cancel')}
                          >
                            <Text style={styles.cancelLateButtonText}>Cancel (100% Refund)</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                      {ride.status === 'assigned' && !checkIfDriverLate(ride) && (
                        <TouchableOpacity 
                          style={styles.confirmButton}
                          onPress={() => confirmPickup(ride)}
                        >
                          <Ionicons name="checkmark-circle" size={18} color="#fff" />
                          <Text style={styles.confirmButtonText}>Confirm Pickup</Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Show cancel button for all active rides */}
                      {!checkIfDriverLate(ride) && (
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={() => cancelRide(ride)}
                        >
                          <Ionicons name="close-circle" size={18} color="#fff" />
                          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                        </TouchableOpacity>
                      )}
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
              <>
                {rideHistory.map((ride) => (
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
              ))}
              
              {/* Clear History Button */}
              <TouchableOpacity 
                style={styles.clearHistoryButton}
                onPress={clearHistory}
              >
                <Ionicons name="trash-outline" size={18} color="#F44336" />
                <Text style={styles.clearHistoryText}>Clear History</Text>
              </TouchableOpacity>
            </>
            )}
          </>
        )}
      </ScrollView>

      {/* Pickup Confirmation Modal */}
      <Modal
        visible={showPickupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPickupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="car" size={50} color="#4CAF50" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Confirm Pickup</Text>
            {selectedRide && (
              <View style={styles.modalInfoBox}>
                <Ionicons name="location" size={20} color="#4CAF50" />
                <Text style={styles.modalAddress}>{selectedRide.pickup.address}</Text>
              </View>
            )}
            <Text style={styles.modalSubtext}>Have you been picked up by your driver?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setShowPickupModal(false)}
              >
                <Text style={styles.modalCancelText}>Not Yet</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn}
                onPress={handlePickupConfirmed}
              >
                <Text style={styles.modalConfirmText}>Yes, Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <Ionicons 
              name={selectedRide?.status === 'cancelled' ? 'alert-circle' : 'checkmark-circle'} 
              size={60} 
              color={selectedRide?.status === 'cancelled' ? '#FF9800' : '#4CAF50'} 
              style={{ marginBottom: 16 }} 
            />
            <Text style={styles.modalTitle}>
              {selectedRide?.status === 'cancelled' ? 'Submit Complaint' : 'Trip Completed!'}
            </Text>
            <Text style={styles.modalSubtext}>
              {selectedRide?.status === 'cancelled' ? 'Rate your experience and tell us what went wrong' : 'Rate your experience'}
            </Text>
            
            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color="#FFD700"
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowFeedbackModal(false);
                  setRating(5);
                  setComment('');
                  setSelectedRide(null);
                  loadRides();
                }}
              >
                <Text style={styles.modalCancelText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmBtn}
                onPress={submitFeedback}
              >
                <Text style={styles.modalConfirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  arrivingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  arrivingTime: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
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
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  clearHistoryText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  driverLateContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  driverLateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
  },
  driverLateButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  waitButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center',
  },
  waitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelLateButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F44336',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelLateButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  feedbackModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  modalAddress: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginRight: 5,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    marginLeft: 5,
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 20,
  },
  commentInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 14,
  },});

export default RidesScreen;