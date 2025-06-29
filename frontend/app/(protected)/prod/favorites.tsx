import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useUserStore } from "@/store/user-store";
import { useFonts } from "expo-font";
import { router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from '@expo/vector-icons';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

import ProductCard from "@/components/productCard";
import { Background } from "@react-navigation/elements";


export default function FavoritesScreen() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const { fetchFavoriteProducts, favoriteProducts } = useUserStore();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return null;
      try {
        setLoading(true);
        const favorites = await fetchFavoriteProducts(user.id);
        console.log("Favorite products fetched:", favoriteProducts);

      } catch (error) {
        console.error("Error fetching favorite products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);



  const handleProductPress = (productId: string) => {
    router.push(`/prod/${productId}`);
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={HS.loadingContainer}>
        <Text style={HS.loadingText}> Loading favorites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[HS.container , styles.favContainer]}>
      <View style={HS.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={HS.headerTitle}> Favorites</Text>
        <View style={{ width: 24 }} />
      </View>

      <View>
      <FlatList
        data={favoriteProducts}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onPress={() => handleProductPress(item._id)}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        ListEmptyComponent={
          <View style={HS.emptyContainer}>
            <Text style={HS.emptyTitle}>No favorites yet</Text>
            <Text style={HS.emptySubtitle}>
              Products you like will appear here
            </Text>
          </View>
        }
       
      />
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  favContainer:  {
    backgroundColor: '#f9f9f9',
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: "space-between",
  },
  
});