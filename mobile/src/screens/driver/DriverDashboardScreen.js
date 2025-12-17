import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { driverAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DriverDashboardScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const result = await driverAPI.getEarnings();
      setEarnings(result);
    } catch (error) {
      console.error('Failed to load earnings');
    }
  };

  const toggleOnline = async () => {
    setLoading(true);
    try {
      if (!isOnline) {
        // Go online with mock location
        await driverAPI.goOnline(40.7128, -74.006);
        setIsOnline(true);
        Alert.alert('Success', 'You are now online');
      } else {
        await driverAPI.goOffline();
        setIsOnline(false);
        Alert.alert('Success', 'You are now offline');
      }
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Driver Status</Text>
        <Text style={[styles.statusValue, isOnline && styles.online]}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Text>
        
        <TouchableOpacity
          style={[styles.toggleButton, isOnline && styles.toggleButtonOnline]}
          onPress={toggleOnline}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.toggleButtonText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {earnings && (
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>Earnings</Text>
          
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>Today:</Text>
            <Text style={styles.earningValue}>
              ₹{earnings.today?.earning || 0}
            </Text>
          </View>
          
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>This Week:</Text>
            <Text style={styles.earningValue}>₹{earnings.week || 0}</Text>
          </View>
          
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>This Month:</Text>
            <Text style={styles.earningValue}>₹{earnings.month || 0}</Text>
          </View>
          
          <View style={styles.earningRow}>
            <Text style={styles.earningLabel}>All Time:</Text>
            <Text style={styles.earningValue}>₹{earnings.allTime || 0}</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{earnings.totalRidesCompleted}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{earnings.rating?.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 20,
  },
  online: {
    color: '#00cc00',
  },
  toggleButton: {
    backgroundColor: '#000',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  toggleButtonOnline: {
    backgroundColor: '#ff3333',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  earningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  earningLabel: {
    fontSize: 16,
    color: '#666',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});
