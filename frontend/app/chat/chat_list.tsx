import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';

//import conversationService from '../../services/conversationService';

export default function ChatListScreen() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchConversations();

//     // Actualizar la lista cuando la pantalla obtiene el foco
//     const unsubscribe = navigation.addListener('focus', () => {
//       fetchConversations();
//     });

//     return unsubscribe;
//   }, [navigation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      setError('No se pudieron cargar las conversaciones. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = ({ item }) => {
    // Determinar el otro participante (no el usuario actual)
    const otherParticipant = item.participants.find(
      participant => participant._id !== user._id
    );

    // Determinar si hay mensajes no leídos
    const hasUnreadMessages = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          { backgroundColor: theme.colors.card }
        ]}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item._id,
          name: otherParticipant.name,
          productId: item.product?._id,
          productTitle: item.product?.title
        })}
      >
        <Image
          source={{ uri: otherParticipant.profilePicture }}
          style={styles.avatar}
        />
        
        {hasUnreadMessages && (
          <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text 
              style={[
                styles.participantName, 
                { color: theme.colors.text },
                hasUnreadMessages && styles.boldText
              ]}
              numberOfLines={1}
            >
              {otherParticipant.name}
            </Text>
            <Text 
              style={[
                styles.timeText, 
                { color: theme.colors.gray },
                hasUnreadMessages && styles.boldText
              ]}
            >
              {formatTime(item.lastMessage.timestamp)}
            </Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            {item.product && (
              <Text 
                style={[
                  styles.productText, 
                  { color: theme.colors.primary },
                  hasUnreadMessages && styles.boldText
                ]}
                numberOfLines={1}
              >
                {item.product.title}
              </Text>
            )}
            
            <Text 
              style={[
                styles.messagePreview, 
                { color: hasUnreadMessages ? theme.colors.text : theme.colors.gray },
                hasUnreadMessages && styles.boldText
              ]}
              numberOfLines={1}
            >
              {item.lastMessage.sender === user._id ? 'Tú: ' : ''}{item.lastMessage.content}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para formatear la hora del último mensaje
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Si es hoy, mostrar solo la hora
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es esta semana, mostrar el día
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    }
    
    // Si es este año, mostrar día y mes
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    // Si es otro año, mostrar día, mes y año
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Cargando conversaciones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={fetchConversations}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.gray} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          No tienes conversaciones
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.gray }]}>
          Cuando contactes con un vendedor, aparecerá aquí
        </Text>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.exploreButtonText}>Explorar productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onRefresh={fetchConversations}
        refreshing={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  timeText: {
    fontSize: 12,
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
