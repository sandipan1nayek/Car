import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');
  const { updateUser, user } = useAuth();

  // Reload wallet when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadWallet();
    }, [])
  );

  const loadWallet = async () => {
    try {
      const result = await userAPI.getWallet();
      setBalance(result.balance);
    } catch (error) {
      Alert.alert('Error', 'Failed to load wallet');
    }
  };

  const initiatePayment = () => {
    const value = parseInt(amount);
    if (!value || value < 1 || value > 10000) {
      Alert.alert('Error', 'Enter amount between ₹1 and ₹10,000');
      return;
    }
    setShowPaymentModal(true);
  };

  const processPayment = async (method) => {
    setSelectedMethod(method);
    setProcessingPayment(true);
    
    // Simulate secure payment processing
    const steps = [
      'Connecting to payment gateway...',
      'Authenticating payment method...',
      'Processing transaction securely...',
      'Updating wallet balance...',
      'Payment successful!'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setPaymentStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Actually add money
    try {
      const value = parseInt(amount);
      const result = await userAPI.addMoney(value);
      setBalance(result.newBalance);
      setAmount('');
      updateUser({ wallet_balance: result.newBalance });
      await loadWallet();
      
      // Generate fake transaction ID
      const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
      
      setProcessingPayment(false);
      setShowPaymentModal(false);
      setPaymentStep('');
      
      Alert.alert(
        '✓ Payment Successful', 
        `₹${value} added to your wallet\n\nTransaction ID: ${txnId}\nPayment Method: ${method}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      setProcessingPayment(false);
      setShowPaymentModal(false);
      setPaymentStep('');
      Alert.alert('Error', error.error || 'Payment failed');
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
          onPress={initiatePayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          🔒 Secure payment gateway
        </Text>
      </View>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !processingPayment && setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!processingPayment ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Payment Method</Text>
                  <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <View style={styles.amountDisplay}>
                  <Text style={styles.amountLabel}>Amount to Add</Text>
                  <Text style={styles.amountValue}>₹{amount}</Text>
                </View>

                <ScrollView style={styles.paymentMethods}>
                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => processPayment('UPI')}
                  >
                    <Ionicons name="logo-google" size={24} color="#4285F4" />
                    <Text style={styles.paymentText}>UPI / Google Pay</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => processPayment('Debit Card')}
                  >
                    <Ionicons name="card" size={24} color="#FF6B6B" />
                    <Text style={styles.paymentText}>Debit / Credit Card</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => processPayment('Net Banking')}
                  >
                    <Ionicons name="business" size={24} color="#4CAF50" />
                    <Text style={styles.paymentText}>Net Banking</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.paymentOption}
                    onPress={() => processPayment('Wallet')}
                  >
                    <Ionicons name="wallet" size={24} color="#FF9800" />
                    <Text style={styles.paymentText}>Other Wallets</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </ScrollView>

                <View style={styles.securityBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.securityText}>
                    256-bit SSL Encrypted • PCI DSS Compliant
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.processingTitle}>{selectedMethod}</Text>
                <Text style={styles.processingText}>{paymentStep}</Text>
                <View style={styles.securityIndicator}>
                  <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                  <Text style={styles.securityLabel}>Secure Connection</Text>
                </View>
              </View>
            )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  amountDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  paymentMethods: {
    marginBottom: 15,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  paymentText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4CAF50',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  securityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
  },
  securityLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});
