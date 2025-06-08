import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, useUser} from '@clerk/clerk-expo';
import { useFonts } from "expo-font";
import { Ionicons } from '@expo/vector-icons';

import { User } from '@/services/types';
import Toast from 'react-native-toast-message';
import ProductCard from '@/components/productCard';
import PostCard from '@/components/postCard';
import { useUserStore } from '@/store/user-store';
import { useProductStore } from '@/store/product-store';
import { usePostStore } from '@/store/post-store';
import { useFollowStore } from '@/store/follow-store';


export default function OtherProfile() {
  const { id } = useLocalSearchParams() as { id: string };
  const { user } = useUser();
  const { isLoaded } = useAuth();
  const { fetchObjectUser,fetchUser, user : userr } = useUserStore();
  const { fetchProductsByClerkId, userProducts} = useProductStore();
  const { fetchPostsByClerkId, userPosts } = usePostStore();
  const { followers, following, fetchFollowers, fetchFollowing, followUser, unfollowUser } = useFollowStore();
  const router = useRouter();

  const [userData, setUserData] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState('Products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });


  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {

        if (user?.id) {
          const myData = await fetchUser(user.id);
          // setCurrentUser(myData);
        }
        const userResponse = await fetchObjectUser(id);
        setUserData(userResponse);
        console.log(userResponse.clerkUserId);

        const productResponse = await fetchProductsByClerkId(user.id);
        await fetchPostsByClerkId(userResponse.clerkUserId);
        await fetchFollowers(userResponse.clerkUserId);
        await fetchFollowing(userResponse.clerkUserId);
        
        

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isLoaded]);

  useEffect(() => {
    if (user?.id) {
      setIsFollowing(followers.some(f => f._id === user?.id));
    }
  }, [followers, user?.id]);

  const handleFollowToggle = async () => {
    // console.log(user?.id)
    // console.log(id)
    if(!user?.id){
      return
    }
    console.log('FOLLOW FUNCTION')
    try {
      if (isFollowing) {
        await unfollowUser(id, user?.id);
      } else {
        if(userData?.clerkUserId) {
          console.log('FOLLOW', userData?._id, userr?._id);
          const responseFollow = await followUser(userr?._id, userData?._id);
          console.log(responseFollow);
        }
        
      }
      await Promise.all([fetchFollowers(id as string), fetchFollowing(id as string)]);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.message });
    }
  };


  return (
      <SafeAreaView>
      {/* Profile Info */}
      <View style={styles.container}>
      <View style={styles.profileContainer}>
        
        <View style={styles.followStats}>
          <View style={styles.followItem}>
            <Text style={styles.followCount}>{followers.length}</Text>
            <Text style={styles.followLabel}>followers</Text>
          </View>

          <Image
      
          source={{ uri: user?.imageUrl }}
          style={styles.profileImage} 
          />
        
          <View style={styles.followItem}>
            <Text style={styles.followCount}>{following.length}</Text>
            <Text style={styles.followLabel}>following</Text>
          </View>
        </View>
      </View>

      {/* User Info */}
      <Text style={styles.username}>{userData?.firstName}</Text>
      <Text style={styles.handle}>{userData?.username}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color="black" />
      <Text style={styles.locationText}>{userData?.country.name.toUpperCase()}, {userData?.city.name.toUpperCase()} </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleFollowToggle}>
          <Text style={styles.actionButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Products', 'Post', 'Reviews'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextSelected,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>
      </View>
      {/* Render Products */}
      {selectedTab === 'Products' && (
        <FlatList
          data={userProducts}
          renderItem={({ item }) => <ProductCard item={item} 
          onPress={()=> router.push(`/prod/${item._id}`)}/>}
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
          data={userPosts[user?.id || '']}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push({ pathname: '/post/modify_post', params: { id: item._id } })}>
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
              <Text style={styles.placeholderText}>No products available</Text>
            </View>
          )}
        />
      )}


    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
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
