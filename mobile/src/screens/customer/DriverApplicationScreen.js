import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DriverApplicationScreen({ navigation }) {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    vehicleColor: '',
    licenseNumber: '',
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.vehicleMake || !formData.vehicleModel || !formData.vehicleYear || 
        !formData.vehiclePlate || !formData.vehicleColor || !formData.licenseNumber) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.vehicleYear.length !== 4 || isNaN(formData.vehicleYear)) {
      Alert.alert('Error', 'Please enter a valid 4-digit year');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.applyAsDriver({
        vehicle_info: {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          year: parseInt(formData.vehicleYear),
          plate: formData.vehiclePlate,
          color: formData.vehicleColor,
        },
        driver_documents: {
          license: formData.licenseNumber,
        },
      });

      // Update user context
      const userData = await authAPI.getMe();
      updateUser(userData.user);

      Alert.alert('Success', 'Driver application submitted! Wait for admin approval.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Apply as Driver</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <Text style={styles.label}>Vehicle Make *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Honda, Toyota, Maruti"
          value={formData.vehicleMake}
          onChangeText={(text) => setFormData({ ...formData, vehicleMake: text })}
        />

        <Text style={styles.label}>Vehicle Model *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., City, Fortuner, Swift"
          value={formData.vehicleModel}
          onChangeText={(text) => setFormData({ ...formData, vehicleModel: text })}
        />

        <Text style={styles.label}>Vehicle Year *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2020"
          keyboardType="numeric"
          maxLength={4}
          value={formData.vehicleYear}
          onChangeText={(text) => setFormData({ ...formData, vehicleYear: text })}
        />

        <Text style={styles.label}>License Plate Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., WB 02 AB 1234"
          value={formData.vehiclePlate}
          onChangeText={(text) => setFormData({ ...formData, vehiclePlate: text.toUpperCase() })}
        />

        <Text style={styles.label}>Vehicle Color *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., White, Black, Silver"
          value={formData.vehicleColor}
          onChangeText={(text) => setFormData({ ...formData, vehicleColor: text })}
        />

        <Text style={styles.sectionTitle}>Driver License</Text>

        <Text style={styles.label}>License Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., WB0120230012345"
          value={formData.licenseNumber}
          onChangeText={(text) => setFormData({ ...formData, licenseNumber: text.toUpperCase() })}
        />

        <Text style={styles.note}>
          Note: Your application will be reviewed by an admin. You will be notified once approved.
        </Text>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  note: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
