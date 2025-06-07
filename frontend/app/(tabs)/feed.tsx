import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useFonts } from 'expo-font';

// Simulated Types
interface PostAuthor {
  _id: string;
  username: string;
  profilePicture: string;
}

interface PostComment {
  _id: string;
  author: PostAuthor;
  text: string;
  createdAt: string;
}

interface SocialPost {
  _id: string;
  author: PostAuthor;
  text: string;
  images?: string[];
  createdAt: string; // e.g., "Fa 2 hores", "Ahir a les 15:30"
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  recentComments?: PostComment[];
}

// Mock Data
const mockSocialFeed: SocialPost[] = [
  {
    _id: 'post3',
    author: {
      _id: 'user_erik',
      username: 'Erik S.',
      profilePicture: 'https://via.placeholder.com/50x50.png?text=ES',
    },
    text: 'Sopar d´intercanvi aquest divendres a les 20:00h al menjador comú. Porteu alguna cosa per compartir! 🍕🥗🍰',
    createdAt: 'Fa 2 dies',
    likesCount: 28,
    commentsCount: 12,
    isLikedByUser: false,
  },
  {
    _id: 'post1',
    author: {
      _id: 'user_anna',
      username: 'Anna S.',
      profilePicture: 'https://via.placeholder.com/50x50.png?text=AS',
    },
    text: 'Hola a tothom! Algú sap on puc trobar una bona botiga de segona mà per a llibres de text a prop del campus de Blindern? Gràcies! #ErasmusOslo #Consells',
    createdAt: 'Fa 3 hores',
    likesCount: 15,
    commentsCount: 4,
    isLikedByUser: false,
    recentComments: [
      {
        _id: 'c1',
        author: {
          _id: 'user_marc',
          username: 'Marc R.',
          profilePicture: 'https://via.placeholder.com/30x30.png?text=MR',
        },
        text: 'Jo vaig trobar algunes coses interessants a Akademika!',
        createdAt: 'Fa 1 hora',
      },
    ],
  },
  {
    _id: 'post2',
    author: {
      _id: 'user_carlota',
      username: 'Carlota G.',
      profilePicture: 'https://via.placeholder.com/50x50.png?text=CG',
    },
    text: 'Primera nevada de la temporada! Oslo és màgic ❄️ Qui s´apunta a fer un ninot de neu? ☃️',
    images: [
      'https://via.placeholder.com/300x200.png?text=Snowy+Oslo',
      'https://via.placeholder.com/300x200.png?text=Snowman',
    ],
    createdAt: 'Ahir',
    likesCount: 42,
    commentsCount: 8,
    isLikedByUser: true,
  },
];

const PostCard = memo(({ post, onLikePress, onProfilePress, onPostDetailPress }: {
  post: SocialPost;
  onLikePress: (postId: string) => void;
  onProfilePress: (userId: string) => void;
  onPostDetailPress: (postId: string) => void;
}) => (
  <View style={styles.postCard}>
    <TouchableOpacity style={styles.authorSection} onPress={() => onProfilePress(post.author._id)}>
      <Image source={{ uri: post.author.profilePicture }} style={styles.authorAvatar} />
      <View>
        <Text style={styles.authorName}>{post.author.username}</Text>
        <Text style={styles.postTimestamp}>{post.createdAt}</Text>
      </View>
    </TouchableOpacity>

    <Text style={styles.postText}>{post.text}</Text>

    {post.images && post.images.length > 0 && (
      <FlatList
        data={post.images}
        horizontal
        keyExtractor={(img, index) => `${post._id}-img-${index}`}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.postImage} />
        )}
        style={styles.postImagesContainer}
        showsHorizontalScrollIndicator={false}
      />
    )}

    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButton} onPress={() => onLikePress(post._id)}>
        <Ionicons
          name={post.isLikedByUser ? 'heart' : 'heart-outline'}
          size={22}
          color={post.isLikedByUser ? '#E91E63' : '#6B7280'}
        />
        <Text style={styles.actionText}>{post.likesCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionButton} onPress={() => onPostDetailPress(post._id)}>
        <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
        <Text style={styles.actionText}>{post.commentsCount}</Text>
      </TouchableOpacity>
    </View>

    {post.recentComments && post.recentComments.length > 0 && (
      <View style={styles.commentsPreviewSection}>
        <TouchableOpacity onPress={() => onPostDetailPress(post._id)}>
          <Text style={styles.viewAllCommentsText}>View all {post.commentsCount} comments</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
));

export default function Feed() {
  const router = useRouter();
  const [feedPosts, setFeedPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const fetchPosts = useCallback(
    (isRefresh = false) => {
      if (!isRefresh) setLoading(true);
      setError(null);
      setTimeout(() => {
        try {
          setFeedPosts(mockSocialFeed);
          if (!isRefresh) setLoading(false);
          if (isRefresh) setRefreshing(false);
        } catch (err) {
          setError('Failed to load feed. Please try again.');
          if (!isRefresh) setLoading(false);
          if (isRefresh) setRefreshing(false);
        }
      }, 1500);
    },
    [],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, [fetchPosts]);

  const handleLikePress = useCallback((postId: string) => {
    setFeedPosts((posts) =>
      posts.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLikedByUser: !post.isLikedByUser,
              likesCount: post.isLikedByUser ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post,
      ),
    );
  }, []);

  const navigateToUserProfile = useCallback((userId: string) => {
    router.push('/profile');
  }, [router]);

  const navigateToPostDetail = useCallback((postId: string) => {
    router.push('/post');
  }, [router]);

  if (!fontsLoaded) {
    return null; // Avoid rendering until fonts are loaded
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3D5AF1" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Social Feed',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/post/create_post')} style={styles.headerButton}>
              <Ionicons name="add-circle-outline" size={28} color="#3D5AF1" />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={feedPosts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLikePress={handleLikePress}
            onProfilePress={navigateToUserProfile}
            onPostDetailPress={navigateToPostDetail}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.feedList}
        contentContainerStyle={styles.feedListContent}
        ListEmptyComponent={() => (
          <View style={styles.centeredEmptyFeed}>
            <Ionicons name="people-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyFeedText}>The feed is quiet right now.</Text>
            <Text style={styles.emptyFeedSubText}>Be the first to share something!</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3D5AF1']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  centeredEmptyFeed: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
  emptyFeedText: { marginTop: 15, fontSize: 18, fontWeight: '600', color: '#4B5563', fontFamily: 'PlusJakartaSans-Bold' },
  emptyFeedSubText: { marginTop: 5, fontSize: 14, color: '#6B7280', textAlign: 'center', fontFamily: 'PlusJakartaSans-Regular' },
  feedList: { flex: 1 },
  feedListContent: { paddingVertical: 10, paddingHorizontal: 5 },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  authorSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  authorName: { fontSize: 16, fontWeight: '600', color: '#1F2937', fontFamily: 'PlusJakartaSans-Bold' },
  postTimestamp: { fontSize: 13, color: '#6B7280', fontFamily: 'PlusJakartaSans-Regular' },
  postText: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 12, fontFamily: 'PlusJakartaSans-Regular' },
  postImagesContainer: { marginBottom: 12 },
  postImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  actionText: { marginLeft: 8, fontSize: 14, color: '#6B7280', fontFamily: 'PlusJakartaSans-Regular' },
  commentsPreviewSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewAllCommentsText: {
    fontSize: 14,
    color: '#3D5AF1',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerButton: { marginRight: 15 },
  errorText: { fontSize: 16, color: '#EF4444', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 10 },
  retryButton: {
    backgroundColor: '#3D5AF1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'PlusJakartaSans-Bold' },
});