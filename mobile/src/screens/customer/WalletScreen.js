import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const result = await userAPI.getWallet();
      setBalance(result.balance);
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet');
    }
  };

  const addMoney = async () => {
    const value = parseInt(amount);
    if (!value || value < 1 || value > 10000) {
      Alert.alert('Error', 'Enter amount between ₹1 and ₹10,000');
      return;
    }

    setLoading(true);
    try {
      const result = await userAPI.addMoney(value);
      setBalance(result.newBalance);
      setAmount('');
      updateUser({ wallet_balance: result.newBalance });
      Alert.alert('Success', `₹${value} added to wallet`);
    } catch (error) {
      Alert.alert('Error', error.error || 'Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceValue}>₹{balance}</Text>
      </View>

      <View style={styles.addMoneyCard}>
        <Text style={styles.cardTitle}>Add Money</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter amount (₹)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={addMoney}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Money</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * This is a simulated payment for demo purposes
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  addMoneyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    backgroundColor: '#000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 15,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
