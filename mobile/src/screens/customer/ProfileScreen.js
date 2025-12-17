import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isDriver } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
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
            <Text style={styles.infoValue}>
              {user?.driver_status || 'Offline'}
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
