import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '@/services/types';
import { useChatStore } from '@/store/chat-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useUser();
  const theme = useTheme();

  const { conversations, fetchConversations, isLoading } = useChatStore();

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
    const other = item.participants.find((p) => p.clerkUserId !== user?.id);
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
              sellerId: other._id,
              sellerUsername: other.username,
              profilePhoto: other.profilePicture,
            },
          })
        }
      >
        <Image source={{ uri: other.profilePicture }} style={styles.avatar} />

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName]} numberOfLines={2}>
              {other.firstName} {other.lastName}
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

  if (loading || isLoading) {
    return (
      <View style={[HS.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[HS.loadingText, { color: theme.colors.text }]}> Loading conversations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[HS.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} />
        <Text style={[HS.errorText, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={getConversations}
        >
          <Text style={styles.retryButtonText}> Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="chatbubbles-outline" size={64} />
        <Text style={[HS.emptyTitle, { color: theme.colors.text }]}>
          There are no conversations
        </Text>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.exploreButtonText}>Explore products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={HS.container}>
      <View style={HS.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text style={HS.headerTitle}> Chats </Text>
        <View style={{ width: 24 }} />

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
  listContent: {
    paddingVertical: 10,
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
  exploreButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
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
  participantUsername: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
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
