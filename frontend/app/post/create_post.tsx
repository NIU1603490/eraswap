import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function create_post() {
  const router = useRouter();
  const { user, getToken } = useClerk();

  const [postText, setPostText] = useState('');
  const [image, setImage] = useState('');

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const handleCancel = () => {
    router.back();
  };

  const handlePublish = () => {
    try {
      const token = getToken();
      
      
    } catch (error) {
      
    }
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
  };

  const profileImage = user?.imageUrl;
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={!postText}
          style={[styles.headerButton, !postText && styles.disabledButton]}
        >
          <Text style={styles.publishButton}>Publish</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerPost}>
        <View style={styles.containerContent}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TextInput
            style={styles.postText}
            value={postText}
            onChangeText={setPostText}
            placeholder="What are you thinking?"
            placeholderTextColor="#666"
            multiline
            autoFocus
          />
        </View>

        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage}>
              <Ionicons name="trash" size={16} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
            <Ionicons name="image" size={24} color="#007AFF" />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15, // Increased padding for better breathing room
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15, // Added margin for separation
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  cancelButton: {
    fontSize: 14,
    color: 'red',
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
  },
  publishButton: {
    fontSize: 14,
    color: '#007AFF',
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    
  },
  disabledButton: {
    opacity: 0.5, // Dimmed when disabled
  },
  containerPost: {
    marginTop: 15, // Slightly increased for better spacing
    flexDirection: 'column',
    gap: 15, // Increased gap for consistency
  },
  containerContent: {
    flexDirection: 'row',
    gap: 15, // Increased gap for better separation
    alignItems: 'flex-start',
    width: '100%',
  },
  postText: {
    fontFamily: 'PlusJakartaSans-Regular',
    minHeight: 200,
    flex: 1, // Allows text input to expand
    borderWidth: 1,
    borderColor: '#ddd', // Lighter border for subtlety
    borderRadius: 12, // Slightly larger radius
    padding: 12, // Increased padding for comfort
    textAlignVertical: 'top', // Ensures text starts at the top
  },
  profileImage: {
    width: 40, // Slightly larger for visibility
    height: 40,
    borderRadius: 20,
    marginTop: 5, // Adjusted for alignment
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250, // Increased height for better image display
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    elevation: 2, // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for contrast
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addImageText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});