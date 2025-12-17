import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ManagerDashboardScreen({ navigation }) {
  const { user } = useAuth();

  const managerOptions = [
    { 
      id: 'drivers', 
      title: 'Manage Drivers', 
      icon: 'car', 
      description: 'View and manage driver accounts' 
    },
    { 
      id: 'rides', 
      title: 'Ride Management', 
      icon: 'map', 
      description: 'Monitor ongoing and completed rides' 
    },
    { 
      id: 'reports', 
      title: 'Reports', 
      icon: 'stats-chart', 
      description: 'View analytics and reports' 
    },
    { 
      id: 'support', 
      title: 'Customer Support', 
      icon: 'help-circle', 
      description: 'Handle customer complaints and issues' 
    },
  ];

  const handleOptionPress = (optionId) => {
    // Placeholder for future implementation
    alert(`${optionId} feature coming soon!`);
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
          <Text style={styles.headerTitle}>Manager Dashboard</Text>
          <Text style={styles.headerSubtitle}>{user?.name}</Text>
        </View>
      </View>

      {/* Manager Options */}
      <ScrollView style={styles.content}>
        {managerOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => handleOptionPress(option.title)}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon} size={32} color="#4CAF50" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#4CAF50',
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
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});
