import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  ScrollView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Send, Camera, Phone, CheckCircle } from 'lucide-react-native';
import BebaText from '../components/atoms/BebaText';
import { Palette, Spacing, Typography } from '../constants/theme';

const ChatThreadScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  
  // Data from navigation params or defaults
  const customerName = route.params?.name || "Ester"; 
  const orderId = route.params?.orderId || "#WE6K-78RFE4";

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello, are you near the pickup point?', sender: 'customer', time: '10:30 PM' },
    { id: '2', text: 'Yes, I just picked up the package from Makola Market.', sender: 'me', time: '10:31 PM' },
    { id: '3', text: 'Great! I am at the gate now, please come down.', sender: 'customer', time: '10:32 PM' },
  ]);

  // Listen for the POD photo returned from the Camera flow
  useEffect(() => {
    if (route.params?.podPhoto) {
      const newEvidence = {
        id: Date.now().toString(),
        type: 'evidence',
        imageUri: route.params.podPhoto.uri,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        orderId: orderId
      };
      setMessages(prev => [...prev, newEvidence]);
    }
  }, [route.params?.podPhoto]);

  const quickReplies = [
    "I've arrived",
    "On my way!",
    "Stuck in traffic",
    "Call me please"
  ];

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    
    // Handle Evidence Message Type
    if (item.type === 'evidence') {
      return (
        <View style={[styles.messageRow, styles.myRow]}>
          <View style={styles.evidenceCard}>
            <View style={styles.evidenceHeader}>
              <BebaText category="body4" color={Palette.white}>DELIVERY EVIDENCE</BebaText>
              <CheckCircle size={14} color={Palette.primary} />
            </View>
            <Image source={{ uri: item.imageUri }} style={styles.evidenceImage} />
            <View style={styles.evidenceFooter}>
              <BebaText category="body4" color={Palette.gray400}>{item.time} • GPS Verified</BebaText>
            </View>
          </View>
        </View>
      );
    }

    // Handle Standard Text Message
    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.theirRow]}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <BebaText category="body3" color={isMe ? Palette.white : Palette.textPrimary}>
            {item.text}
          </BebaText>
          <BebaText 
            category="body4" 
            color={isMe ? 'rgba(255,255,255,0.7)' : Palette.textSecondary} 
            style={styles.timeText}
          >
            {item.time}
          </BebaText>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* 1. Functional Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={Palette.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <BebaText category="h3" color={Palette.textPrimary}>{customerName}</BebaText>
          <BebaText category="body4" color={Palette.primary}>{orderId}</BebaText>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={() => {/* Linking.openURL tel */}}>
          <Phone size={20} color={Palette.primary} />
        </TouchableOpacity>
      </View>

      {/* 2. Chat Area */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* 3. Operational Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.quickReplyScroll}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {quickReplies.map((reply, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickReplyBadge}
              onPress={() => sendMessage(reply)}
            >
              <BebaText category="body4" color={Palette.textPrimary}>{reply}</BebaText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TouchableOpacity 
            style={styles.attachmentButton} 
            onPress={() => navigation.navigate('PODCamera', { customerName, orderId })}
          >
            <Camera size={26} color={Palette.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={Palette.gray400}
            multiline
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && { opacity: 0.5 }]} 
            onPress={() => sendMessage(message)}
            disabled={!message.trim()}
          >
            <Send size={20} color={Palette.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingBottom: 15,
    backgroundColor: Palette.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    gap: 12
  },
  headerInfo: { flex: 1 },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,166,62,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: { padding: Spacing.gutter, paddingBottom: 20 },
  messageRow: { marginBottom: 16, flexDirection: 'row', width: '100%' },
  myRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Palette.secondary, // Deep Teal
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: Palette.surface,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  
  // Evidence Card Styling
  evidenceCard: {
    width: '85%',
    backgroundColor: Palette.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center'
  },
  evidenceImage: {
    width: '100%',
    height: 200,
    backgroundColor: Palette.gray200,
  },
  evidenceFooter: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: Palette.secondary
  },

  footer: { backgroundColor: Palette.surface, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Palette.gray100 },
  quickReplyScroll: { paddingHorizontal: Spacing.gutter, marginBottom: 12 },
  quickReplyBadge: {
    backgroundColor: Palette.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Palette.gray200
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.gutter,
    gap: 12
  },
  attachmentButton: { padding: 4 },
  input: {
    flex: 1,
    backgroundColor: Palette.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: Palette.textPrimary,
    ...Typography.body3
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ChatThreadScreen;