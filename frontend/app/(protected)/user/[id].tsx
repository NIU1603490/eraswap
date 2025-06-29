import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import ProductCard from '@/components/productCard';
import PostCard from '@/components/postCard';
import { useUserStore } from '@/store/user-store';
import { useProductStore } from '@/store/product-store';
import { useFollowStore } from '@/store/follow-store';
import { usePostStore } from '@/store/post-store';
import { useChatStore } from '@/store/chat-store';
import { User } from '@/services/types';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function OtherProfile() {
  const { id } = useLocalSearchParams<{ id: string }>(); //Object id
  const router = useRouter();
  const { user } = useUser();

  const { fetchObjectUser, fetchUser, user: current, selectedUser } = useUserStore();
  const { fetchProductsByClerkId, userProducts } = useProductStore();
  const { fetchPostsByClerkId, userPosts } = usePostStore();
  const { followers, following, isLoading, fetchFollowers, fetchFollowing, followUser, unfollowUser } = useFollowStore();
  const { findOrCreateConversation } = useChatStore();

  const [profileData, setProfileData] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState('Products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (!id)
        return;
      console.log(id);
      try {
        if (user?.id) {
          await fetchUser(user.id);
          if (id == current?._id) {
            router.push('/profile');
          }
        }
        const profile = await fetchObjectUser(id as string);
        setProfileData(profile);

        await fetchProductsByClerkId(profile.clerkUserId);
        await fetchPostsByClerkId(profile.clerkUserId);
        await fetchFollowers(id as string);
        await fetchFollowing(id as string);

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del usuario');
        Toast.show({ type: 'error', text1: err.message });
      } finally {
        setLoading(false);
        console.log('current:', current);
        console.log('selectedUser', selectedUser);
      }
    };
    loadData();
  }, [id, user?.id]);

  useEffect(() => {
    if (current) {
      setIsFollowing(followers.some(f => f._id === current._id));
    }
  }, [followers, current]);

  const handleFollowToggle = async () => {
    console.log('handleFollowToggle called');

    if (!current || !id) return;

    //optimistic update
    if (isFollowing) {
      useFollowStore.setState({ followers: followers.filter(u => u._id !== current._id) });
    } else {
      useFollowStore.setState({ followers: [...followers, current] });
    }
    try {
      console.log('isFollowing:', isFollowing);
      if (isFollowing) {
        await unfollowUser(current._id, id);
      } else {
        await followUser(current._id, id);
      }
      await fetchFollowers(id);
      // await fetchFollowing(id);
    } catch (err: any) {
      setError(err.message || 'Error to toggle follow status');
      await fetchFollowers(id);
    }
  };

  const handleMessage = async () => {
    if (!current || !profileData) return;
    try {
      const conversation = await findOrCreateConversation({
        senderId: current._id,
        receiverId: profileData._id,
      });

      router.push({
        pathname: '/chat/chat_detail',
        params: {
          chatId: conversation._id,
          sellerId: profileData._id,
          sellerUsername: profileData.username,
          profilePhoto: profileData.profilePicture,
        }
      })
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3D5AF1" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error || 'User not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.followStats}>
            <View style={styles.followItem}>
              <Text style={styles.followCount}>{followers.length}</Text>
              <Text style={styles.followLabel}>followers</Text>
            </View>

            <Image source={{ uri: selectedUser?.profilePicture }} style={styles.profileImage} />

            <View style={styles.followItem}>
              <Text style={styles.followCount}>{following.length}</Text>
              <Text style={styles.followLabel}>following</Text>
            </View>
          </View>
        </View>

        <Text style={styles.username}>{selectedUser?.firstName}</Text>
        <Text style={styles.handle}>@{selectedUser?.username}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="black" />
          <Text style={styles.locationText}>{selectedUser?.country.name.toUpperCase()}, {profileData?.city.name.toUpperCase()}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, isFollowing && styles.unfollowButton]}
            onPress={handleFollowToggle}>
            <Text style={[styles.actionButtonText, , isFollowing && styles.unfollowButtonText]}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.unfollowButton]} onPress={handleMessage}>
            <Text style={styles.unfollowButtonText}> Message </Text>
          </TouchableOpacity>
        </View>


        <View style={styles.tabContainer}>
          {['Products', 'Post', 'Reviews'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.tabButton} onPress={() => setSelectedTab(tab)}>
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextSelected]}>
                {tab}
              </Text>
              {selectedTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Render Products */}
        <View style={styles.postContainer}>
          {selectedTab === 'Products' && (
            <FlatList
              data={userProducts}
              renderItem={({ item }) => (<ProductCard item={item} onPress={() => router.push(`/prod/${item._id}`)} />)}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.productRow}
              ListEmptyComponent={() => (
                <View style={styles.placeholderContent}>
                  <Text style={styles.placeholderText}>No products available</Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Render Post */}
        {selectedTab === 'Post' && (
          <FlatList
            style={styles.postContainer}
            data={userPosts[user?.id || '']}
            renderItem={({ item }) => (
              <TouchableOpacity>
                <PostCard
                  post={item}
                  onLikePress={() => { }}
                  onProfilePress={() => { }}
                />
              </TouchableOpacity>

            )}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={() => (
              <View style={styles.placeholderContent}>
                <Text style={styles.placeholderText}>No post available</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center'
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 100,
  },
  followStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  },
  followItem: {
    alignItems: 'center',
    marginTop: 50,
  },
  followCount: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  followLabel: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
  },
  username: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
  },
  handle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
    textAlign: 'center',
    marginVertical: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  actionButton: {
    borderRadius: 20,
    width: '40%',
    paddingVertical: 6,
    marginHorizontal: 10,
    backgroundColor: '#54a7ff',
  },
  unfollowButton: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#fff',
    color: '#000',
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'white',
  },
  unfollowButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 15,
    marginTop: 10,
  },
  tabButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
  },
  tabTextSelected: {
    color: 'black',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: 'black',
    marginTop: 3,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  postContainer: {
    paddingTop: 5,
    backgroundColor: '#f9f9f9',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
  },
});