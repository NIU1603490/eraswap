import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function CreateScreen() {
  const handleCreateProduct = () => {
    router.push("/prod/create_product");
  };

  const handleCreatePost = () => {
    router.push("/post/create_post");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.option}
          onPress={handleCreateProduct}
          activeOpacity={0.8}
        >
        <View style={styles.iconContainer}>
            <Ionicons name="cart" size={24} color="#007AFF" />
          </View>
          <Text style={styles.optionText}>Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={24} color="#007AFF" />
          </View>
          <Text style={styles.optionText}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 132, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});