import React, { useState, useEffect, useCallback } from 'react';
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
import { useUser }  from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { usePostStore } from '@/store/post-store';
import { Post } from '@/services/types';
import  PostCard from '@/components/postCard';


export default function Feed() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { posts, isLoading, error: postError, fetchPosts, likePost, unlikePost } = usePostStore();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback( async () => { 
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const handleLikePress = useCallback(
    async (postId: string, liked: boolean) => {

      if (liked) {
        await unlikePost(postId, user?.id || '');
      } else {
        await likePost(postId, user?.id  || '');
      }
    },
    [likePost, unlikePost],
  );

  const navigateToUserProfile = useCallback((userId: string) => {
    router.push(`/user/${userId}`);
  }, [router]);

  const navigateToPostDetail = useCallback((postId: string) => {
    router.push('/post');
  }, [router]);

  if (!fontsLoaded) {
    return null; // Avoid rendering until fonts are loaded
  }

  if (isLoading) {
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
    <SafeAreaView>
      <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLikePress={handleLikePress}
            onProfilePress={navigateToUserProfile}
            // onPostDetailPress={navigateToPostDetail}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    // flex: 1,
    backgroundColor: '#F3F4F6'
  },
  centered:  { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6'
  },
  centeredEmptyFeed: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50
  },
  emptyFeedText: { marginTop: 15, fontSize: 18, fontWeight: '600', color: '#4B5563', fontFamily: 'PlusJakartaSans-Bold' },
  emptyFeedSubText: { marginTop: 5, fontSize: 14, color: '#6B7280', textAlign: 'center', fontFamily: 'PlusJakartaSans-Regular' },
  feedList: { 
    //flex: 1,
  },
  feedListContent: { 
    paddingVertical: 10, 
    paddingHorizontal: 5,
  },
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