import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useUser } from '@clerk/clerk-expo';
import { useProductStore } from '@/store/product-store';
import { useUserStore } from '@/store/user-store';
import { useChatStore } from '@/store/chat-store';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function ProductDetail() {
  const { id } = useLocalSearchParams() as { id: string }; // product id
  const router = useRouter();
  const { user } = useUser();

  const { fetchProductById, deleteProduct, isLoading: productLoading, error: productError, selectedProduct } = useProductStore();
  const { fetchObjectUser, selectedUser, isLoading, user: currentUser } = useUserStore();
  const { findOrCreateConversation } = useChatStore();


  const [activeIndex, setActiveIndex] = useState(0);
  const [isAvailable, setIsAvailable] = useState(Boolean);
  const [images, setImages] = useState<string[]>([]);


  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    if (id) {
      fetchProductById(id).catch((err) => {
        console.error('Error fetching product:', err);
      });
    }
  }, [id, fetchProductById]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (selectedProduct?.seller) {
        try {
          await fetchObjectUser(selectedProduct.seller);
          setIsAvailable(selectedProduct.status === 'Available');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [selectedProduct]);


  useEffect(() => {
    if (selectedProduct?.images && selectedProduct?.images?.length > 0) {

      setImages(selectedProduct.images);
    } else {
      setImages(['https://via.placeholder.com/400x300.png?text=No+Image']);
    }
  }, [selectedProduct]);


  const handleDeleteProduct = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id, user.id);
              Alert.alert('Success', 'Product deleted successfully');
              router.back();
            } catch (error) {
              Alert.alert('Error', productError || 'Failed to delete product');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleMessageUser = async () => {
    try {
      console.log(selectedUser?._id);
      if (!currentUser || !selectedUser) return;
      console.log('USER ID', currentUser._id);
      const conversation = await findOrCreateConversation({
        senderId: currentUser?._id,
        receiverId: selectedUser._id,
        productId: selectedProduct?._id,
      });

      console.log('Send a message');
      router.push({
        pathname: '/chat/chat_detail',
        params: {
          chatId: conversation._id,
          id: selectedProduct?._id,
          sellerId: selectedUser?._id,
          sellerUsername: selectedUser?.username,
          profilePhoto: selectedUser?.profilePicture
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  if (!fontsLoaded || productLoading || isLoading) {
    return (
      <SafeAreaView style={HS.container}>
        <View style={HS.loadingContainer}>
          <ActivityIndicator size="large" color="#3D5AF1" />
        </View>
      </SafeAreaView>
    );
  }

  if (productError || !selectedProduct || !selectedUser) {
    return (
      <SafeAreaView style={HS.container}>
        <View style={HS.errorContainer}>
          <Text style={HS.errorText}>{productError || 'Product or seller not found'}</Text>
          <TouchableOpacity style={styles.backButtonError} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSeller = user?.id === selectedUser.clerkUserId;

  console.log(images);
  const renderImageItem = ({ item }: { item: string }) => (
    <Image source={{ uri: item }} style={styles.carouselImage} />
  );

  const onScroll = (event: any) => {
    const slideSize = Dimensions.get('window').width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={[HS.container, isSeller && styles.sellerContainer]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={HS.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={HS.headerTitle}>{selectedProduct.title || 'Unknown Product'}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Carrusel d'imatges */}
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          style={styles.carousel}
          getItemLayout={(data, index) => ({
            length: Dimensions.get('window').width,
            offset: Dimensions.get('window').width * index,
            index,
          })}
        />

        {/* Indicadors */}
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Seller Info */}
          <View style={styles.sellerInfoContainer}>
            <Image
              source={{ uri: user?.imageUrl || 'https://via.placeholder.com/40x40.png?text=Seller' }}
              style={styles.sellerImage}
            />
            <View style={styles.sellerTextContainer}>
              <TouchableOpacity onPress={() => router.push(`/user/${selectedUser._id}`)}>
                <Text style={styles.sellerName}>
                  {selectedUser.firstName || 'Unknown'} {selectedUser.lastName || 'Seller'}
                </Text>
                <Text style={styles.selleruserName}>@{selectedUser.username || 'unknown'}</Text>
                <View style={styles.sellerRatingContainer}>
                  {[...Array(Math.floor(selectedUser.rating.average || 0))].map((_, i) => (
                    <Ionicons key={`full-${i}`} name="star" size={16} color="#F59E0B" />
                  ))}
                  {selectedUser.rating.average % 1 !== 0 && (
                    <Ionicons name="star-half" size={16} color="#F59E0B" />
                  )}
                  {[...Array(5 - Math.ceil(selectedUser.rating.average || 0))].map((_, i) => (
                    <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#F59E0B" />
                  ))}
                  <Text style={styles.sellerReviews}>({selectedUser.rating.count || 0})</Text>

            </View>
              </TouchableOpacity>

          </View>
        </View>

        {/* Product Details */}
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{selectedProduct.description || 'No description available'}</Text>

        <Text style={styles.metaText}>
          Location: {selectedProduct.location.city?.name}, {selectedProduct.location.country?.name}
        </Text>
        <Text style={styles.metaText}>Category: {selectedProduct.category}</Text>
        <Text style={styles.metaText}>Condition: {selectedProduct.condition}</Text>
        <Text style={styles.metaTextStatus}>Status: {selectedProduct.status}</Text>
        <Text style={styles.productPrice}>
          {selectedProduct.price.amount} {selectedProduct.price.currency}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        {isSeller ? (
          <>
            <TouchableOpacity
              style={styles.modifyButton}
              onPress={() =>
                router.push({
                  pathname: `/prod/modify_product`,
                  params: { id: selectedProduct._id },
                })
              }
            >
              <Text style={styles.modifyButtonText}>Modify</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.sendMessageButton}
              onPress={handleMessageUser}>
              <Text style={styles.sendMessageButtonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buyNowButton,
              !(isAvailable) && styles.disabledButton]}
              disabled={!(selectedProduct.status == 'Available')}
              onPress={() =>
                router.push({
                  pathname: `/purch/[id]`,
                  params: { id: selectedProduct._id, sellerId: selectedUser.clerkUserId },
                })
              }
            >
              <Text style={styles.buyNowButtonText} >Buy Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  sellerContainer: {
    backgroundColor: 'fff',
  },
  backButtonError: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3D5AF1',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  carousel: {
    height: 300,
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
    backgroundColor: '#E5E7EB',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3D5AF1',
    width: 12,
  },
  infoSection: {
    padding: 15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sellerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sellerImage: {
    width: 45,
    height: 45,
    borderRadius: 100,
    marginRight: 10,
    backgroundColor: '#E5E7EB',
  },
  sellerTextContainer: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
  },
  selleruserName: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  sellerRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerReviews: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 5,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#6B7280',
    marginBottom: 5,
  },
  metaTextStatus: {
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productPrice: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#3D5AF1',
    marginVertical: 10,
    alignSelf: 'flex-end',
  },
  descriptionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#374151',
    marginBottom: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sendMessageButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3D5AF1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sendMessageButtonText: {
    color: '#3D5AF1',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  buyNowButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#3D5AF1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  modifyButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#3D5AF1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  disabledButtonText: {
    color: '#999',
  },
});