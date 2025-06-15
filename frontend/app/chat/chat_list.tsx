import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '@/services/types';
import { useChatStore } from '@/store/chat-store';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useUser();
  const theme = useTheme();

  const { conversations, fetchConversations }= useChatStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getConversations = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      await fetchConversations(user.id);
    } catch (error) {
      console.error('Error to load conversaions:', error);
      setError('No se pudieron cargar las conversaciones. Please, try it again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConversations();
  }, [user?.id]);

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const other = item.participants.find((p) => p.clerkUserId!== user?.id);
    // console.log('other',other);
    if (!other) return null;

    return (
      <TouchableOpacity
      style={styles.conversationItem}
      onPress={() =>
        router.push({
          pathname: '/chat/chat_detail',
          params: {
            chatId: item._id,
            id: item.product?._id,
            sellerId: other.clerkUserId, 
            sellerUsername: other.username,
            profilePhoto: other.profilePicture,
          },
        })
      }
      >
      <Image source={{ uri: other.profilePicture }} style={styles.avatar} />
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName]} numberOfLines={1}>
            {other.username}
            </Text>

          {item.lastMessage && (
              <Text style={[styles.timeText]}> {formatTime(item.lastMessage.createdAt)} </Text>
            )}
        
          </View>
          {item.product && (
            <Text style={[styles.productText, { color: theme.colors.primary }]} numberOfLines={1}>
              {item.product.title}
            </Text>
          )}
          {item.lastMessage && (
            <Text style={[styles.messagePreview]} numberOfLines={1}>
              {item.lastMessage.sender._id === user?.id ? 'You ' : ''}
              {item.lastMessage.content}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Función para formatear la hora del último mensaje
  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // if is today, show only the hour
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // if its this week the day
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days[date.getDay()];
    }
    
    //if is this year only the year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // if its other year, showe only month and year
    return date.toLocaleDateString([], { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}> Loading conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={getConversations}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="chatbubbles-outline" size={64} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          There are no conversations
        </Text>
        <Text style={[styles.emptySubtitle]}>
          Cuando contactes con un vendedor, aparecerá aquí
        </Text>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.exploreButtonText}>Explorar productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.headerTitle}> Chats </Text>
      </View>

      

      </View>
    <View>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={getConversations}
        refreshing={loading}
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header:{
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle:{
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  listContent: {
    paddingVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  exploreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: '#F9FAFB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  unreadBadge: {
    position: 'absolute',
    top: 15,
    left: 45,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  participantName: {
    fontSize: 16,
    flex: 1,
    marginRight: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  messagePreviewContainer: {
    flex: 1,
  },
  productText: {
    fontSize: 14,
    marginBottom: 2,
  },
  messagePreview: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
