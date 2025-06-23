import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '@/components/productCard';
import { useFonts } from 'expo-font';
import { useOverlay } from '@/contexts/overlayContext';
import { Product } from '@/services/types';
import { useProductStore } from '@/store/product-store';
import { useUserStore } from '@/store/user-store';
import { categories } from '@/assets/constants/constants';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function Home() {
  const { user } = useUser();
  const { fetchUser, user: USER } = useUserStore();
  const { isSignedIn, isLoaded } = useAuth();
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, isLoading, error, fetchProducts } = useProductStore(); // get products from the store
  const router = useRouter();

  useEffect(() => {
    if (user?.id) {
      fetchProducts(user.id);
      fetchUser(user.id);
    }

  }, [fetchProducts, fetchUser]);

  if (!isLoaded || !fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isSignedIn) {
    console.log('User is not signed in');
    return <Redirect href="/(auth)/signup" />;
  }

  //filter the products to only show the products that are not created by the user
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={22} color="black" />
          <Text style={styles.locationText}>{USER?.city.name.toUpperCase()}, {USER?.country.name.toUpperCase()}</Text>
          <Ionicons name="chevron-down" size={16} color="black" />
        </View>
      </View>


      {/*Search bar*/}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search "Economy Book"'
          placeholderTextColor="gray"
        />
        <Ionicons name="filter" size={20} color="gray" />
      </View>

      {/*Category filter*/}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonSelected,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/*Products list*/}
      <FlatList
        style={styles.products}
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => router.push(`/prod/${item._id}`)}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListEmptyComponent={
            <View style={HS.emptyContainer}>
              <Text style={HS.emptyTitle}>No products available</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 30,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 13,
    borderColor: 'gray',
    borderWidth: 0.8,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: 'black',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  categoryButton: {
    backgroundColor: '#E8EDF5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 5,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'black',
  },
  categoryTextSelected: {
    color: 'white',
  },
  productRow: {
    marginTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  products: {
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 8,
    marginBottom: 40,
    backgroundColor: '#F3F4F6'
  },
});