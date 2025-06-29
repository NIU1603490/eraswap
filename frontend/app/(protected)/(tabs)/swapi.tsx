
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage, sendChatMessage } from '@/services/geminiService';
import * as SecureStore from 'expo-secure-store';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

const formatBoldText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <Text key={index} style={{ fontFamily: 'PlusJakartaSans-Bold'}}>
        {part}
      </Text>
    ) : (
      <Text key={index}>{part}</Text>
    )
  );
};


export default function Swapi() {
  const initialMessage: ChatMessage = {
    role: 'system',
    content: 'You are a helpful assistant who helps Eraswap users.'

  }
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await SecureStore.getItemAsync('swapi-messages');
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load sotred messages', error);
      }

    }
    loadMessages();

  }, [])

  useEffect(() => {
    SecureStore.setItemAsync('swapi_messages', JSON.stringify(messages)).catch(
      (err) => console.error('Failed to save messages', err),
    );
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg]; // complet history

    setMessages(updatedMessages); // update UI with the new message
    setInput('');
    setLoading(true);

    try {
      //send the history to the backend
      const reply = await sendChatMessage(updatedMessages);
      setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Error al enviar mensaje a la IA:", err);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error contacting IA. Please, try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setMessages([initialMessage]);
    try {
      await SecureStore.deleteItemAsync('swapi_messages');
    } catch (error) {
      console.error('Failed to clear messages', error);
    }

  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
      <View style={{ flex: 1 }}>
        <View style={HS.header}>
          <Text style={HS.headerTitle}> Swapi AI</Text>

          <TouchableOpacity onPress={handleClear}>
            <Text style={HS.cancelButton}> Clear </Text>
          </TouchableOpacity>

        </View>
        <ScrollView 
          ref = {scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}>

          {messages.filter(m => m.role !== 'system').map((msg, idx) => (
            <View key={idx} style={[styles.message, msg.role === 'user' ? styles.userMsg : styles.assistantMsg]}>
              <Text style={styles.messageText}>{formatBoldText(msg.content)}</Text>
            </View>
          ))}
          {loading && <ActivityIndicator size="small" color="#0000ff" style={HS.loadingContainer} />}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Write your message"
            editable={!loading}
            returnKeyType='send'
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  chatArea: { 
    flex: 1,
    padding: 10 },
  chatContent: { 
    paddingBottom: 20
  },
  message: { 
    marginVertical: 4,
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%'
  },
  userMsg: { 
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6'
  },
  assistantMsg: { 
    alignSelf: 'flex-start',
    backgroundColor: '#F1F0F0'
  },
  messageText: { 
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  loadingText: { 
    alignSelf: 'center',
    marginVertical: 8
  },
  inputRow: { 
    flexDirection: 'row', 
    padding: 8, 
    borderTopWidth: 1, 
    borderColor: '#ccc', 
    alignItems: 'center',
  },
  input: { 
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginRight: 8,
    minHeight: 40
  },
  sendButton: { 
    backgroundColor: '#3D5AF1',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 20,
    minHeight: 40
  },
  sendText: { 
    color: '#fff',
    fontFamily: 'Plus-Jakarta-Bold'},
});