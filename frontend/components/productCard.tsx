import { View, Text,Image, TouchableOpacity, StyleSheet} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import {Product} from '../services/types'
import { Heart } from "lucide-react-native";
import { useProductStore } from '../store/product-store';
import { useUserStore } from '../store/user-store';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';


const ProductCard = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const { user } = useUser();
  const clerkUserId = user?.id || '';
  const router = useRouter();

  const { addFavorite, removeFavorite, isFavorite} = useUserStore();
  const storeFav = isFavorite(item._id);
  const [localFav, setLocalFav] = useState(storeFav);
  

  useEffect(() => {
    setLocalFav(storeFav);
  }, [storeFav]);

  const handleToggleFavorite = async () => {
    console.log('Toggling favorite for item:', item._id);
    console.log('Current favorite state:', storeFav);
    
    try {
      if(storeFav) {
        await removeFavorite(item._id, clerkUserId);
      } else {
        await addFavorite(item._id, clerkUserId);
      }
      setLocalFav(!storeFav);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setLocalFav(storeFav);
    }

    
  }

  return (
    <View style={styles.productCard}>
    <TouchableOpacity  onPress={onPress}>
      <View style={styles.productImageContainer}>
      <Image 
      source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }}
      style={styles.productImage} 
      resizeMode='cover'
      />
      </View>

    <TouchableOpacity style={styles.favoriteIcon} onPress={handleToggleFavorite}>
      <Ionicons
              name={localFav ? 'heart' : 'heart-outline'}
              size={20}
              color={localFav ? 'red' : 'gray'}
            />
      {/* <Heart 
      size={20}
      color="black"
      fill={isFavorite(item._id) ? 'red' : 'none'}/> */}
    </TouchableOpacity>

    <View style={styles.productInfo}>
    <Text style={styles.productName}>{item.title}</Text>

    <Text style={styles.productLocation}>
        {item.location.city.name}, {item.location.country.name}
    </Text>

    <Text style={styles.productStatus}>{item.status}</Text>

    <Text style={styles.productPrice}>{item.price.amount} {item.price.currency}</Text>
    </View>
  </TouchableOpacity>
  </View>
  )
}

export default ProductCard;

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 15,
    overflow: 'hidden', // Ensure the image doesn't overflow
    borderColor: 'gray',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 250,
    
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'white',
    borderRadius: 100 ,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    padding: 10,
    gap: 3,
  },
  productName: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#1F2937',
  },
  productLocation: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'right',
  },
  productStatus: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
