import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const { user } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleEmail = () => {
    setShowEmailModal(true);
  };

  const sendEmail = async () => {
    if (!emailSubject || !emailMessage) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSending(true);
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSending(false);
    setShowEmailModal(false);
    setEmailSubject('');
    setEmailMessage('');
    
    Alert.alert(
      '✓ Email Sent Successfully',
      'Our support team will respond within 24 hours.\n\nTicket ID: #' + Date.now().toString(36).toUpperCase(),
      [{ text: 'OK' }]
    );
  };

  const handleWhatsApp = () => {
    setShowWhatsAppModal(true);
  };

  const sendWhatsApp = async () => {
    if (!whatsappMessage) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setSending(true);
    
    // Simulate connecting to WhatsApp
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setSending(false);
    setShowWhatsAppModal(false);
    setWhatsappMessage('');
    
    Alert.alert(
      '✓ Opening WhatsApp',
      'You will be redirected to WhatsApp to continue the conversation with our support team.\n\nSupport available: Mon-Sat, 9 AM - 9 PM',
      [{ text: 'OK' }]
    );
  };

  const handleCall = () => {
    setShowCallModal(true);
  };

  const makeCall = async (type) => {
    setShowCallModal(false);
    
    const messages = {
      support: {
        title: '📞 Connecting to Support',
        message: 'Connecting you to our customer support team...\n\nSupport Line: +91 1800-XXX-XXXX\n\nAverage wait time: 2 minutes'
      },
      emergency: {
        title: '🚨 Emergency Support',
        message: 'Connecting to emergency support immediately...\n\nEmergency Line: +91 1800-XXX-YYYY\n\nAvailable 24/7'
      }
    };

    Alert.alert(
      messages[type].title,
      messages[type].message,
      [{ text: 'Cancel' }, { text: 'Call Now', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={40} color="#4CAF50" />
        </View>
        <Text style={styles.headerTitle}>Customer Support</Text>
        <Text style={styles.headerSubtitle}>We're here to help you 24/7</Text>
      </View>

      <View style={styles.supportOptions}>
        {/* Email Option */}
        <TouchableOpacity style={styles.optionCard} onPress={handleEmail}>
          <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="mail" size={32} color="#2196F3" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Email Support</Text>
            <Text style={styles.optionSubtitle}>Response within 24 hours</Text>
            <Text style={styles.optionEmail}>support@carapp.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* WhatsApp Option */}
        <TouchableOpacity style={styles.optionCard} onPress={handleWhatsApp}>
          <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>WhatsApp Chat</Text>
            <Text style={styles.optionSubtitle}>Instant messaging support</Text>
            <View style={styles.statusBadge}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.statusText}>Online Now</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Call Option */}
        <TouchableOpacity style={styles.optionCard} onPress={handleCall}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="call" size={32} color="#FF9800" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Phone Support</Text>
            <Text style={styles.optionSubtitle}>Talk to our support team</Text>
            <Text style={styles.optionEmail}>+91 1800-XXX-XXXX</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Common Topics</Text>
        <View style={styles.topicsList}>
          <View style={styles.topicItem}>
            <Ionicons name="help-circle" size={20} color="#666" />
            <Text style={styles.topicText}>How to book a ride</Text>
          </View>
          <View style={styles.topicItem}>
            <Ionicons name="help-circle" size={20} color="#666" />
            <Text style={styles.topicText}>Payment & wallet issues</Text>
          </View>
          <View style={styles.topicItem}>
            <Ionicons name="help-circle" size={20} color="#666" />
            <Text style={styles.topicText}>Ride cancellation policy</Text>
          </View>
          <View style={styles.topicItem}>
            <Ionicons name="help-circle" size={20} color="#666" />
            <Text style={styles.topicText}>Account & profile settings</Text>
          </View>
        </View>
      </View>

      {/* Email Modal */}
      <Modal
        visible={showEmailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !sending && setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Email</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>From</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject"
                value={emailSubject}
                onChangeText={setEmailSubject}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue or question..."
                value={emailMessage}
                onChangeText={setEmailMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendEmail}
              disabled={sending}
            >
              {sending ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Send Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal
        visible={showWhatsAppModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !sending && setShowWhatsAppModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.whatsappHeader}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
                <View style={styles.whatsappInfo}>
                  <Text style={styles.modalTitle}>Car App Support</Text>
                  <Text style={styles.whatsappStatus}>Online • Replies instantly</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowWhatsAppModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.chatPreview}>
              <View style={styles.receivedMessage}>
                <Text style={styles.messageText}>
                  Hi {user?.name?.split(' ')[0]}! 👋{'\n\n'}
                  How can I help you today?
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message here..."
                value={whatsappMessage}
                onChangeText={setWhatsappMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: '#25D366' }]}
              onPress={sendWhatsApp}
              disabled={sending}
            >
              {sending ? (
                <Text style={styles.sendButtonText}>Opening WhatsApp...</Text>
              ) : (
                <>
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Continue on WhatsApp</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Call Modal */}
      <Modal
        visible={showCallModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCallModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.callModalContent}>
            <Text style={styles.callModalTitle}>Select Call Type</Text>

            <TouchableOpacity
              style={styles.callOption}
              onPress={() => makeCall('support')}
            >
              <Ionicons name="headset" size={32} color="#2196F3" />
              <View style={styles.callOptionText}>
                <Text style={styles.callOptionTitle}>Customer Support</Text>
                <Text style={styles.callOptionSubtitle}>
                  General queries & assistance
                </Text>
                <Text style={styles.callNumber}>+91 1800-XXX-XXXX</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callOption}
              onPress={() => makeCall('emergency')}
            >
              <Ionicons name="warning" size={32} color="#FF5252" />
              <View style={styles.callOptionText}>
                <Text style={styles.callOptionTitle}>Emergency Support</Text>
                <Text style={styles.callOptionSubtitle}>
                  Urgent ride issues & safety concerns
                </Text>
                <Text style={styles.callNumber}>+91 1800-XXX-YYYY</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelCallButton}
              onPress={() => setShowCallModal(false)}
            >
              <Text style={styles.cancelCallText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerIcon: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  supportOptions: {
    padding: 15,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  optionEmail: {
    fontSize: 12,
    color: '#2196F3',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whatsappInfo: {
    flex: 1,
  },
  whatsappStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  chatPreview: {
    backgroundColor: '#ECE5DD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  receivedMessage: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
  },
  callModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
  },
  callModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  callOption: {
    flexDirection: 'row',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  callOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  callOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  callOptionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  callNumber: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  cancelCallButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelCallText: {
    fontSize: 16,
    color: '#666',
  },
});
