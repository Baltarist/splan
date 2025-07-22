import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import {
  sendChatMessage,
  selectChatMessages,
  selectIsChatLoading,
  selectChatError,
  addUserMessage,
  clearChat,
} from '../../store/slices/aiSlice';
import { Ionicons } from '@expo/vector-icons';

const AIChatScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(selectChatMessages);
  const isLoading = useSelector(selectIsChatLoading);
  const error = useSelector(selectChatError);
  
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
    }
  }, [error]);

  useEffect(() => {
    // Scroll to bottom when new message arrives
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat immediately
    dispatch(addUserMessage(message));
    
    try {
      await dispatch(sendChatMessage({ message })).unwrap();
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Sohbeti Temizle',
      'Tüm mesajları silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Temizle', style: 'destructive', onPress: () => dispatch(clearChat()) },
      ]
    );
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>
        </View>
        <View style={styles.messageInfo}>
          <Text style={styles.messageTime}>
            {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isUser && <Ionicons name="person" size={16} color="#666" />}
          {!isUser && <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    
    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={[styles.messageText, styles.aiText, styles.typingText]}>
              AI yazıyor...
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#007AFF" />
          <Text style={styles.headerTitle}>Splan AI</Text>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => (
          <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessage : styles.aiMessage]}>
            <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.messageText, item.role === 'user' ? styles.userText : styles.aiText]}>
                {item.content}
              </Text>
            </View>
            <View style={styles.messageInfo}>
              <Text style={styles.messageTime}>
                {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              {item.role === 'user' && <Ionicons name="person" size={16} color="#666" />}
              {item.role !== 'user' && <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />}
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="AI'ya bir şeyler sor..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={(!inputMessage.trim() || isLoading) ? "#999" : "#FFF"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1C1C1E',
  },
  clearButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFF',
  },
  aiText: {
    color: '#1C1C1E',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginRight: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
});

export default AIChatScreen; 