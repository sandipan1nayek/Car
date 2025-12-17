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
import { rideAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('pickup'); // pickup, dropoff, confirm

  // Mock locations (same as backend)
  const mockLocations = [
    { name: 'Times Square', lat: 40.758, lng: -73.9855 },
    { name: 'Central Park', lat: 40.7829, lng: -73.9654 },
    { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
    { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
    { name: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
  ];

  const selectLocation = (location) => {
    const coords = {
      lat: location.lat,
      lng: location.lng,
      address: location.name,
    };

    if (step === 'pickup') {
      setPickup(coords);
      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setStep('dropoff');
    } else if (step === 'dropoff') {
      setDropoff(coords);
      setStep('confirm');
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
      const result = await rideAPI.createRide(pickup, dropoff);
      Alert.alert('Success', 'Ride booked! Finding nearby drivers...', [
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
    setStep('pickup');
  };

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
        <Text style={styles.title}>
          {step === 'pickup' && 'Select Pickup Location'}
          {step === 'dropoff' && 'Select Dropoff Location'}
          {step === 'confirm' && 'Confirm Ride'}
        </Text>

        {step !== 'confirm' && (
          <ScrollView style={styles.locationsList}>
            {mockLocations.map((loc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => selectLocation(loc)}
              >
                <Text style={styles.locationName}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {step === 'confirm' && fare && (
          <View>
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
              <Text style={styles.value}>{fare.distance} km</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{fare.duration} min</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Total Fare:</Text>
              <Text style={styles.fareValue}>₹{fare.fare}</Text>
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
          </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  locationsList: {
    maxHeight: 200,
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationName: {
    fontSize: 16,
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
});
