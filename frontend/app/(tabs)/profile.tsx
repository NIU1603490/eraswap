import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Link, useRouter } from "expo-router";
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

export default function Profile() {
  
  const { user } = useUser();
  const { isSignedIn, isLoaded } = useAuth();
  const { fetchUser } = useUserStore();
  const { fetchProductsByClerkId, userProducts} = useProductStore();
  const { fetchPostsByClerkId, userPosts } = usePostStore();
  const { followers, following, fetchFollowers, fetchFollowing } = useFollowStore();
  const router = useRouter();

  const [userData, setUserData] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState('Products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });


  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id || !isLoaded) {
        setLoading(false);
        return;
      }
      try {
        // console.log('Fetching user data for ID:', user.id);
        const userResponse = await fetchUser(user.id);
        // console.log('User data:', userResponse);
        setUserData(userResponse);

        // console.log('Fetching products for user ID:', user.id);
        const productResponse = await fetchProductsByClerkId(user.id);
        // console.log('Product data:', productResponse);

        await fetchPostsByClerkId(user.id);
        console.log('Fetching followers:', user.id);
        const follows = await fetchFollowers(user.id);
        console.log(follows);
        await fetchFollowing(user.id);

      } catch (err: any) {
        setError(err.message || 'Error al cargar los datos del usuario');
        Toast.show({ type: 'error', text1: err.message });
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [user?.id, isLoaded]);


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
      <Text style={styles.username}>{user?.firstName}</Text>
      <Text style={styles.handle}>{user?.username}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color="black" />
      <Text style={styles.locationText}>{userData?.country.name.toUpperCase()}, {userData?.city.name.toUpperCase()} </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/user/modify_profile')}>
          <Text style={styles.actionButtonText}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/purch/manage_purchases')}  >
          <Text style={styles.actionButtonText}> Manage purchases</Text>
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
          style={styles.postContainer}
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
              <Text style={styles.placeholderText}>No post available</Text>
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
  postContainer: {
    marginTop: 10,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:30,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'gray',
  },
});
