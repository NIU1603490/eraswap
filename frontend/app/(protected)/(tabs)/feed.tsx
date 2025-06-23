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
  SafeAreaView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser }  from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { usePostStore } from '@/store/post-store';
import  PostCard from '@/components/postCard';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';


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
    fetchPosts().then(() => {
      console.log(posts);
    }).catch((err) => {
      console.error('Error fetching posts:', err);
    });
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

  if (isLoading || !fontsLoaded) {
    return (
      <SafeAreaView style={HS.container}>
        <View style={HS.loadingContainer}>
          <ActivityIndicator size="large" color="#3D5AF1" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={HS.container}>
        <View style={HS.errorContainer}>
          <Text style={HS.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={HS.container}>
      <View >
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
          <View style={HS.emptyContainer}>
            <Ionicons name="people-outline" size={60} color="#CBD5E1" />
            <Text style={HS.emptyTitle}>The feed is quiet right now.</Text>
            <Text style={HS.emptySubtitle}>Be the first to share something!</Text>
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
  feedList: {
    paddingTop: 10,
    marginBottom: 25,
    backgroundColor: '#F9F9F9',
  },
  feedListContent: { 
    paddingVertical: 15, 
    paddingHorizontal: 5,
  },
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
  retryButton: {
    backgroundColor: '#3D5AF1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'PlusJakartaSans-Bold' },
});