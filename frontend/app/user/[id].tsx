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
import { User } from '@/services/types';

export default function OtherProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const { fetchObjectUser, fetchUser, user: current, selectedUser} = useUserStore();
  const { fetchProductsByClerkId, userProducts } = useProductStore();
  const { fetchPostsByClerkId, userPosts } = usePostStore();
  const { followers, following, fetchFollowers, fetchFollowing, followUser, unfollowUser } = useFollowStore();

  const [profileData, setProfileData] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      try {
        if (user?.id) {
          const myData = await fetchUser(user.id);
          setCurrentUser(myData);
          if(id == myData?._id){
            router.push('/(tabs)/profile');
          }
        }
        const profile = await fetchObjectUser(id as string);
        setProfileData(profile);

        await fetchProductsByClerkId(profile.clerkUserId);
        await fetchPostsByClerkId(profile.clerkUserId);

        await Promise.all([fetchFollowers(id as string), fetchFollowing(id as string)]);
        if (user?.id) {
          const myData = await fetchUser(user.id);
          setCurrentUser(myData);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del usuario');
        Toast.show({ type: 'error', text1: err.message });
      } finally {
        setLoading(false);
        console.log(current);
        console.log(selectedUser);
      }
    };
    loadData();
  }, [id, user?.id]);

  useEffect(() => {
    if (current) {
      setIsFollowing(following.some(f => f._id === current._id));
    }
  }, [following, current]);

  const handleFollowToggle = async () => {
    if (!current || !id) return;
    try {
      if (isFollowing) {
        await unfollowUser(current._id, id as string);
      } else {
        console.log('follow function');
        console.log(current._id);
        await followUser(current._id, id as string);
      }
      await fetchFollowers(id as string);
      await fetchFollowing(id as string);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message });
    }
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

//   if (error || !current || !selectedUser) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <Text>{error || 'User not found'}</Text>
//       </SafeAreaView>
//     );
//   }

  return (
    <SafeAreaView>
      <View style={styles.container}>
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

        {!current ? (
            <ActivityIndicator size="small" color="black" />
            ) : (
              <View style={styles.actionButtons

              }>
                <TouchableOpacity style={styles.actionButton} onPress={handleFollowToggle}>
                <Text style={styles.actionButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
            </TouchableOpacity>

              </View>
            
            )}

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

      {selectedTab === 'Products' && (
        <FlatList
          data={userProducts}
          renderItem={({ item }) => (
            <ProductCard item={item} onPress={() => router.push(`/prod/${item._id}`)} />
          )}
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

      {/* Render Post */}
      {selectedTab === 'Post' && (
        <FlatList
          style={styles.postContainer}
          data={userPosts[user?.id || '']}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <PostCard
                post={item}
                onLikePress={() => {}}
                onProfilePress={() => {}}
                onPostDetailPress={() => {}}
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
  container: {
    // flex: 1,
    backgroundColor: '#fff',
  },
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
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    width: '40%',
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  actionButtonText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
    marginHorizontal: 15,
    marginTop: 10,
  },
  tabButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
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
    marginTop: 5,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  postContainer: {
    marginTop: 10,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
  },
});