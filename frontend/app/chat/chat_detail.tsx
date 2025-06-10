import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth, useUser} from '@clerk/clerk-expo';
import { Message } from '@/services/types';
import * as chatService from '@/services/conversationService';
import socket from '@/services/socket';
// import { GiftedChat, IMessage } from 'react-native-gifted-chat'; // Una alternativa popular


export default function ChatScreen() {
  const router = useRouter();
  const user = useUser();
  const params = useLocalSearchParams<{ chatId?: string; otherUserId?: string; otherUserName?: string; otherUserProfilePicture?: string }>();
  const chatId = params.chatId || params.otherUserId; // L'ID de la conversa o de l'altre usuari
  const otherUserName = params.otherUserName || 'Chat';
  const otherUserProfilePicture = params.otherUserProfilePicture;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await chatService.fetchMessages(chatId as string);
        const formatted = data.map((m) => ({
          _id: m._id,
          text: m.content,
          createdAt: new Date(m.createdAt),
          user: { _id: m.sender._id, name: m.sender.username, avatar: m.sender.profilePicture },
        }));
        setMessages(formatted.sort((a, b) => (b.createdAt as any) - (a.createdAt as any)));
      } catch (err) {
        console.error('Failed to load messages', err);
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      loadMessages();
      socket.emit('joinConversation', chatId);
    }

    const handler = (msg: any) => {
      if (msg.conversation === chatId) {
        const formatted = {
          _id: msg._id,
          text: msg.content,
          createdAt: new Date(msg.createdAt),
          user: { _id: msg.sender._id, name: msg.sender.username, avatar: msg.sender.profilePicture },
        } as Message;
        setMessages((prev) => [formatted, ...prev]);
      }
    };
    socket.on('newMessage', handler);

    return () => {
      socket.off('newMessage', handler);
      socket.emit('leaveConversation', chatId);
    };
  }, [chatId]);

  const onSend = async () => {
    if (inputText.trim().length === 0 || !chatId) {
      return;
    }
    try {
      await chatService.sendMessage({
        conversationId: chatId as string,
        senderId: CURRENT_USER_ID,
        receiverId: params.otherUserId as string,
        content: inputText.trim(),
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

 

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#3D5AF1" /></View>;
  }

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user._id === user.id;
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.messageRowCurrentUser : styles.messageRowOtherUser]}>
        {!isCurrentUser && otherUserProfilePicture && (
          <Image source={{ uri: otherUserProfilePicture }} style={styles.avatarSmall} />
        )}
        <View style={[styles.messageBubble, isCurrentUser ? styles.messageBubbleCurrentUser : styles.messageBubbleOtherUser]}>
          <Text style={isCurrentUser ? styles.messageTextCurrentUser : styles.messageTextOtherUser}>{item.text}</Text>
          <Text style={styles.messageTimestamp}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          header: () => (
            <View style={styles.customHeader}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              {otherUserProfilePicture && (
                <Image source={{ uri: otherUserProfilePicture }} style={styles.headerAvatar} />
              )}
              <Text style={styles.headerTitle} numberOfLines={1}>{otherUserName}</Text>
              <TouchableOpacity style={styles.headerOptionsButton} onPress={() => console.log('Chat options')}>
                <Ionicons name="ellipsis-vertical" size={22} color="#1F2937" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Ajustar segons el header
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id}
          inverted // Mostra els missatges des de baix cap a dalt
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend}>
            <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Custom Header Styles
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    // paddingTop: Platform.OS === 'ios' ? 40 : 10, // Ajust per a la barra d'estat si no s'usa SafeAreaView per al header
  },
  headerBackButton: {
    padding: 5,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerOptionsButton: {
    padding: 5,
  },
  // Message List Styles
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageListContent: {
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  messageRowCurrentUser: {
    justifyContent: 'flex-end',
  },
  messageRowOtherUser: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 5, // Alinea amb la part inferior de la bombolla
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  messageBubbleCurrentUser: {
    backgroundColor: '#3D5AF1',
    borderBottomRightRadius: 4, 
  },
  messageBubbleOtherUser: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  messageTextCurrentUser: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  messageTextOtherUser: {
    fontSize: 15,
    color: '#1F2937',
  },
  messageTimestamp: {
    fontSize: 10,
    color: '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  // Input Area Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: 40,
    maxHeight: 100, // Permet múltiples línies fins a un límit
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3D5AF1',
    borderRadius: 20, // Cercle
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

