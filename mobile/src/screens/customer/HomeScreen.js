import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { rideAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, updateUser } = useAuth();
  const [region, setRegion] = useState({
    latitude: 22.5726,  // Kolkata center
    longitude: 88.3639,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('pickup'); // pickup, dropoff, vehicle, time, confirm
  const [vehicleType, setVehicleType] = useState(null);
  const [selectedTime, setSelectedTime] = useState('now');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Popular locations in Kolkata, West Bengal, India
  const mockLocations = [
    { name: 'Victoria Memorial, Kolkata', lat: 22.5448, lng: 88.3426 },
    { name: 'Howrah Bridge, Kolkata', lat: 22.5851, lng: 88.3468 },
    { name: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3525 },
    { name: 'Salt Lake Stadium, Kolkata', lat: 22.5645, lng: 88.4118 },
    { name: 'Netaji Subhas Airport (CCU)', lat: 22.6546, lng: 88.4467 },
    { name: 'Sealdah Railway Station', lat: 22.5677, lng: 88.3695 },
    { name: 'Dakshineswar Temple', lat: 22.6547, lng: 88.3573 },
    { name: 'Science City, Kolkata', lat: 22.5394, lng: 88.3954 },
    { name: 'Eden Gardens Stadium', lat: 22.5645, lng: 88.3433 },
    { name: 'Esplanade, Kolkata', lat: 22.5626, lng: 88.3510 },
    { name: 'New Market, Kolkata', lat: 22.5558, lng: 88.3508 },
    { name: 'Alipore Zoo, Kolkata', lat: 22.5330, lng: 88.3337 },
  ];

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Using LocationIQ API (free alternative that works better with React Native)
      // Format: https://us1.locationiq.com/v1/search?key=YOUR_API_KEY&q=SEARCH_QUERY&format=json
      // For now, use local mock search across our locations
      const lowerQuery = query.toLowerCase();
      
      // Search through popular locations first
      const matchingLocations = mockLocations.filter(loc => 
        loc.name.toLowerCase().includes(lowerQuery)
      );
      
      // Add some common Kolkata locations that might match
      const additionalLocations = [
        { name: 'Gariahat Market', lat: 22.5183, lng: 88.3647 },
        { name: 'Ballygunge', lat: 22.5326, lng: 88.3657 },
        { name: 'Jadavpur', lat: 22.4997, lng: 88.3670 },
        { name: 'Tollygunge', lat: 22.4983, lng: 88.3544 },
        { name: 'Behala', lat: 22.4859, lng: 88.3102 },
        { name: 'Dum Dum', lat: 22.6271, lng: 88.4170 },
        { name: 'Ultadanga', lat: 22.5957, lng: 88.3835 },
        { name: 'College Street', lat: 22.5733, lng: 88.3626 },
        { name: 'Kalighat Temple', lat: 22.5187, lng: 88.3426 },
        { name: 'Indian Museum', lat: 22.5582, lng: 88.3519 },
        { name: 'Howrah Station', lat: 22.5838, lng: 88.3426 },
        { name: 'Rajarhat', lat: 22.6208, lng: 88.4598 },
        { name: 'Barasat', lat: 22.7221, lng: 88.4847 },
        { name: 'Barrackpore', lat: 22.7636, lng: 88.3749 },
        { name: 'Belgharia', lat: 22.6503, lng: 88.3855 },
      ];
      
      const moreMatches = additionalLocations.filter(loc =>
        loc.name.toLowerCase().includes(lowerQuery) &&
        !matchingLocations.find(m => m.name === loc.name)
      );
      
      const allResults = [...matchingLocations, ...moreMatches].slice(0, 5).map(loc => ({
        name: loc.name,
        address: `${loc.name}, Kolkata, West Bengal`,
        lat: loc.lat,
        lng: loc.lng
      }));
      
      setSearchResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBack = () => {
    if (step === 'dropoff') {
      setStep('pickup');
      setDropoff(null);
      setFare(null);
    } else if (step === 'time') {
      setStep('dropoff');
      setSelectedTime('now');
    } else if (step === 'vehicle') {
      setStep('time');
      setVehicleType(null);
    } else if (step === 'confirm') {
      setStep('vehicle');
    }
  };

  const selectLocation = (location) => {
    const coords = {
      lat: location.lat,
      lng: location.lng,
      address: location.name || location.address,
    };

    if (step === 'pickup') {
      setPickup(coords);
      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setSearchQuery('');
      setSearchResults([]);
      setStep('dropoff');
    } else if (step === 'dropoff') {
      setDropoff(coords);
      setSearchQuery('');
      setSearchResults([]);
      setStep('time');
      getFare(pickup, coords);
    }
  };

  const getFare = async (pickupLoc, dropoffLoc) => {
    setLoading(true);
    try {
      console.log('Getting fare for:', pickupLoc, dropoffLoc);
      const result = await rideAPI.getFareEstimate(pickupLoc, dropoffLoc);
      console.log('Fare result:', result);
      setFare(result);
    } catch (error) {
      console.error('Fare error:', error);
      Alert.alert('Error', error.error || error.message || 'Failed to get fare estimate');
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async () => {
    if (!pickup || !dropoff) return;

    setLoading(true);
    try {
      // Calculate scheduled time based on selected time slot
      let scheduledTime = null;
      if (selectedTime !== 'now') {
        const minutes = selectedTime === '15min' ? 15 : selectedTime === '30min' ? 30 : 60;
        scheduledTime = new Date(Date.now() + minutes * 60000);
      }

      const rideData = {
        pickup,
        dropoff,
        vehicle_type: vehicleType?.id,
        scheduled_time: scheduledTime
      };

      const result = await rideAPI.createRide(rideData.pickup, rideData.dropoff, rideData.vehicle_type, rideData.scheduled_time);
      
      // Fetch updated user data to refresh wallet balance
      const userData = await authAPI.getMe();
      updateUser(userData.user);
      
      Alert.alert('Success', 'Ride booked! Payment deducted from wallet.', [
        { text: 'OK', onPress: reset },
      ]);
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to book ride');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPickup(null);
    setDropoff(null);
    setFare(null);
    setVehicleType(null);
    setSelectedTime('now');
    setStep('pickup');
  };

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: 'bicycle', price: 0.7, seats: '1' },
    { id: 'car', name: 'Car', icon: 'car-sport', price: 1, seats: '4' },
    { id: 'shuttle', name: 'Shuttle', icon: 'bus', price: 0.5, seats: '12' },
    { id: 'special', name: 'Special', icon: 'car', price: 1.5, seats: '4', desc: 'Premium' },
  ];

  const timeSlots = [
    { id: 'now', label: 'Now', time: 'Immediate' },
    { id: '15min', label: 'In 15 mins', time: new Date(Date.now() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
    { id: '30min', label: 'In 30 mins', time: new Date(Date.now() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
    { id: '1hour', label: 'In 1 hour', time: new Date(Date.now() + 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
  ];

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
            title="Pickup"
            pinColor="green"
          />
        )}
        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
            title="Dropoff"
            pinColor="red"
          />
        )}
      </MapView>

      <View style={styles.card}>
        <View style={styles.header}>
          {step !== 'pickup' && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {step === 'pickup' && 'Select Pickup Location'}
            {step === 'dropoff' && 'Select Dropoff Location'}
            {step === 'time' && 'Select Pickup Time'}
            {step === 'vehicle' && 'Select Vehicle Type'}
            {step === 'confirm' && 'Confirm Booking'}
          </Text>
          {step !== 'pickup' && <View style={styles.backButtonPlaceholder} />}
        </View>

        {(step === 'pickup' || step === 'dropoff') && (
          <>
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search location in Kolkata..."
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  searchLocation(text);
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>

            {isSearching && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}

            <ScrollView style={styles.locationsList}>
              {/* Search Results */}
              {searchResults.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Search Results</Text>
                  {searchResults.map((loc, index) => (
                    <TouchableOpacity
                      key={`search-${index}`}
                      style={styles.locationItem}
                      onPress={() => selectLocation(loc)}
                    >
                      <Ionicons name="location" size={20} color="#4CAF50" />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationName}>{loc.name}</Text>
                        <Text style={styles.locationAddress} numberOfLines={1}>{loc.address}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.divider} />
                </>
              )}

              {/* Popular Locations */}
              {!searchQuery && (
                <>
                  <Text style={styles.sectionTitle}>Popular Locations</Text>
                  {mockLocations.map((loc, index) => (
                    <TouchableOpacity
                      key={`popular-${index}`}
                      style={styles.locationItem}
                      onPress={() => selectLocation(loc)}
                    >
                      <Ionicons name="location" size={20} color="#FF9800" />
                      <View style={styles.locationTextContainer}>
                        <Text style={styles.locationName}>{loc.name}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </ScrollView>
          </>
        )}

        {step === 'vehicle' && fare && (
          <ScrollView style={{ maxHeight: 400 }}>
            {vehicleTypes.map((vehicle) => {
              const isDisabled = selectedTime === 'now' && vehicle.id === 'shuttle';
              return (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    vehicleType?.id === vehicle.id && styles.vehicleCardSelected,
                    isDisabled && styles.vehicleCardDisabled
                  ]}
                  onPress={() => !isDisabled && setVehicleType(vehicle)}
                  disabled={isDisabled}
                >
                  <Ionicons 
                    name={vehicle.icon} 
                    size={32} 
                    color={isDisabled ? '#ccc' : vehicleType?.id === vehicle.id ? '#4CAF50' : '#000'} 
                  />
                  <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, isDisabled && styles.vehicleTextDisabled]}>
                      {vehicle.name} {isDisabled && '(Not available for Now)'}
                    </Text>
                    <Text style={[styles.vehicleSeats, isDisabled && styles.vehicleTextDisabled]}>
                      {vehicle.seats} seats {vehicle.desc && `• ${vehicle.desc}`}
                    </Text>
                </View>
                <Text style={[styles.vehiclePrice, isDisabled && styles.vehicleTextDisabled]}>
                  ₹{Math.round(fare.fare * vehicle.price)}
                </Text>
              </TouchableOpacity>
            )})}
            <TouchableOpacity
              style={[styles.bookButton, !vehicleType && styles.bookButtonDisabled]}
              onPress={() => vehicleType && setStep('confirm')}
              disabled={!vehicleType}
            >
              <Text style={styles.bookButtonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 'time' && (
          <ScrollView style={{ maxHeight: 400 }}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.id && styles.timeSlotSelected
                ]}
                onPress={() => setSelectedTime(slot.id)}
              >
                <View>
                  <Text style={styles.timeLabel}>{slot.label}</Text>
                  <Text style={styles.timeValue}>{slot.time}</Text>
                </View>
                {selectedTime === slot.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setStep('vehicle')}
            >
              <Text style={styles.bookButtonText}>Continue</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {step === 'confirm' && fare && vehicleType && (
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={styles.summaryCard}>
              <Ionicons name={vehicleType.icon} size={40} color="#4CAF50" />
              <Text style={styles.vehicleNameLarge}>{vehicleType.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.label}>From:</Text>
              <Text style={styles.value}>{pickup.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>To:</Text>
              <Text style={styles.value}>{dropoff.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Distance:</Text>
              <Text style={styles.value}>{fare.distance_km} km</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{fare.duration_min} min</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Pickup Time:</Text>
              <Text style={styles.value}>{timeSlots.find(s => s.id === selectedTime)?.label}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Total Fare:</Text>
              <Text style={styles.fareValue}>₹{Math.round(fare.fare * vehicleType.price)}</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={bookRide}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bookButtonText}>Book Ride</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={reset}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonPlaceholder: {
    width: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  locationsList: {
    maxHeight: 200,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#000',
  },
  fareLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fareValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  bookButton: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  vehicleCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  vehicleCardDisabled: {
    opacity: 0.4,
    backgroundColor: '#f5f5f5',
  },
  vehicleTextDisabled: {
    color: '#999',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleSeats: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  vehiclePrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginTop: 5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  timeSlot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
  },
  timeSlotSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  summaryCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 15,
  },
  vehicleNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
