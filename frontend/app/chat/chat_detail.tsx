import React, { useState, useEffect, useCallback, useRef } from 'react';
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
// import { GiftedChat, IMessage } from 'react-native-gifted-chat'; // Una alternativa popular

// Tipus simulats
interface Message {
  _id: string;
  text: string;
  createdAt: Date | number;
  user: {
    _id: string | number;
    name?: string;
    avatar?: string;
  };
  // Altres camps com image, video, system message, etc.
}

// Dades de mostra per a una conversa
const mockMessages: Message[] = [
  {
    _id: 'msg7',
    text: 'Genial, ens veiem allà!',
    createdAt: new Date(Date.now() - 60000 * 1),
    user: { _id: 'user_carlota', name: 'Carlota G.' }, // Missatge de l'altre usuari
  },
  {
    _id: 'msg6',
    text: 'Sí, a les 15:00 a la porta de la facultat et va bé?',
    createdAt: new Date(Date.now() - 60000 * 2),
    user: { _id: 'currentUser123', name: 'Jo' }, // Missatge de l'usuari actual
  },
  {
    _id: 'msg5',
    text: 'Perfecte! Podem quedar avui?',
    createdAt: new Date(Date.now() - 60000 * 10),
    user: { _id: 'user_carlota', name: 'Carlota G.' },
  },
  {
    _id: 'msg4',
    text: 'Hola! Encara tens disponible la cadira?',
    createdAt: new Date(Date.now() - 60000 * 12),
    user: { _id: 'currentUser123', name: 'Jo' },
  },
  {
    _id: 'msg3',
    text: 'Molt bé, gràcies!',
    createdAt: new Date(Date.now() - 86400000 * 1), // Ahir
    user: { _id: 'user_carlota', name: 'Carlota G.' },
  },
  {
    _id: 'msg2',
    text: 'El preu és negociable?',
    createdAt: new Date(Date.now() - 86400000 * 1 - 60000 * 5),
    user: { _id: 'currentUser123', name: 'Jo' },
  },
  {
    _id: 'msg1',
    text: 'Hola, estic interessat en el teu anunci de la cadira.',
    createdAt: new Date(Date.now() - 86400000 * 1 - 60000 * 10),
    user: { _id: 'user_carlota', name: 'Carlota G.' },
  },
];

const CURRENT_USER_ID = 'currentUser123'; // ID de l'usuari actual (simulat)

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId?: string; otherUserId?: string; otherUserName?: string; otherUserProfilePicture?: string }>();
  const chatId = params.chatId || params.otherUserId; // L'ID de la conversa o de l'altre usuari
  const otherUserName = params.otherUserName || 'Chat';
  const otherUserProfilePicture = params.otherUserProfilePicture;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Simula la càrrega de missatges per a aquesta conversa
    console.log('Loading messages for chat ID:', chatId);
    setTimeout(() => {
      // Filtra o carrega missatges específics per a `chatId`
      // Per ara, utilitzem els mockMessages ordenats
      setMessages(mockMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    }, 500);
    // En una app real: cridar a l'API per obtenir els missatges de la conversa
    // També, subscriure's a actualitzacions en temps real (Socket.io)
  }, [chatId]);

  const onSend = () => {
    if (inputText.trim().length === 0) {
      return;
    }
    const newMessage: Message = {
      _id: Math.random().toString(36).substring(7), // ID aleatori per al missatge
      text: inputText.trim(),
      createdAt: new Date(),
      user: { _id: CURRENT_USER_ID, name: 'Jo' }, // Usuari actual
    };
    setMessages(previousMessages => [newMessage, ...previousMessages]);
    setInputText('');
    // En una app real: enviar el missatge al servidor via API/Socket.io
    // flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#3D5AF1" /></View>;
  }

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user._id === CURRENT_USER_ID;
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

