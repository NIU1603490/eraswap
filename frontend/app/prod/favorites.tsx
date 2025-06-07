import React from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Stack } from "expo-router";
import { useProductStore } from "../../store/product-store";
import ProductCard from "../../components/productCard";
import { router } from "expo-router";

export default function FavoritesScreen() {
//   const { products, favorites } = useProductStore();
  
//   // Filter products that are in favorites
//   const favoriteProducts = products.filter(product => 
//     favorites.includes(product.id)
//   );

//   const handleProductPress = (productId: string) => {
//     router.push(`/product/${productId}`);
//   };

return (
    <View>
        <Text> Favorites</Text>
    </View>
//     <>
//       <Stack.Screen
//         options={{
//           title: "Favorites",
//           headerTitleStyle: styles.headerTitle,
//         }}
//       />
//       <SafeAreaView style={styles.container}>
//         {favoriteProducts.length > 0 ? (
//           <FlatList
//             data={favoriteProducts}
//             renderItem={({ item }) => (
//               <ProductCard
//                 product={item}
//                 onPress={() => handleProductPress(item.id)}
//               />
//             )}
//             keyExtractor={(item) => item.id}
//             numColumns={2}
//             columnWrapperStyle={styles.productRow}
//             contentContainerStyle={styles.productList}
//           />
//         ) : (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No favorites yet</Text>
//             <Text style={styles.emptySubtext}>
//               Products you like will appear here
//             </Text>
//           </View>
//         )}
//       </SafeAreaView>
//     </>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});