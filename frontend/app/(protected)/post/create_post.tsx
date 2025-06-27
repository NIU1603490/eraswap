import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, ActivityIndicator, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '@/store/post-store';
import { uploadImage } from '@/services/imageService';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function create_post() {
  const router = useRouter();
  const { user } = useClerk();
  const { addPost, isLoading } = usePostStore();

  const [postText, setPostText] = useState('');
  const [image, setImage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  const handleCancel = () => {
    router.back();
  };

  const handlePublish = async () => {
    if (!postText.trim()) return;

    let imageUrl = image ? image : '';
    if (image) {
      try {
        imageUrl = await uploadImage(image);
      } catch (error) {
        console.error('Error uploading image:', error);
        return;
      }
    }

    try {
      await addPost({
        content: postText.trim(),
        image: imageUrl,
        userId: user?.id,
      });
      router.back();
      alert('Post created successfully!');

    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={HS.container}>
        {isPublishing && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>Publishing...</Text>
          </View>
        )}
        <View style={HS.header2}>
          <Text style={HS.headerTitle}> Post </Text>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
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

          <TouchableOpacity
            onPress={handlePublish}
            disabled={!postText || isLoading}
            style={[HS.publishButton, (!postText || isLoading || isPublishing) && HS.disabledButton]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#007aff" />
            ) : (
              <Text style={HS.publishButtonText}>Publish</Text>
            )}
          </TouchableOpacity>

        </KeyboardAvoidingView>
      </SafeAreaView >
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    fontSize: 14,
    color: 'red',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  containerPost: {
    margin: 15,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});