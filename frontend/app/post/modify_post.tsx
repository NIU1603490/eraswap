import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFonts } from 'expo-font';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePostStore } from '@/store/post-store';

export default function ModifyPost() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { posts, updatePost, deletePost } = usePostStore();

  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    const post = posts.find(p => p._id === id);
    if (post) {
      setContent(post.content || '');
      setImage(post.images && post.images[0] ? post.images[0] : '');
    }
  }, [posts, id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await updatePost(id as string, { content, images: image ? [image] : [] });
      router.back();
    } catch (err) {
      console.error('Update post error:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(id as string);
            router.back();
          } catch (err) {
            console.error('Delete post error:', err);
          }
        },
      },
    ]);
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.sellText}>Edit Post</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerPost}>
        <TextInput
          style={styles.postText}
          value={content}
          onChangeText={setContent}
          placeholder="Update your post"
          multiline
        />

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

        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleUpdate} style={styles.buttonPublish}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.buttonDelete}>
                <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
            
        </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    },
    cancelButton: { 
    fontSize: 16,
    color: 'red',
    fontFamily: 'PlusJakartaSans-Bold'
    },
    sellText: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
    },
    buttonPublish: { 
    fontSize: 14,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    },
    buttonDelete: {
    fontSize: 14,
    borderRadius: 16,
    borderColor: 'red',
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    },
    buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
    },
    buttonContainer: {
    padding: 15,
    gap: 15,
    },
    containerPost: {
    margin: 20, 
    gap: 15
    },
    postText: { 
        fontFamily: 'PlusJakartaSans-Regular',
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 12,
        textAlignVertical: 'top',
        backgroundColor: '#FAFAFA',
     },
    imageContainer: { position: 'relative', width: '100%', height: 250, borderRadius: 12, overflow: 'hidden' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImageButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    addImageButton: { flexDirection: 'row', alignItems: 'center', padding: 10 },
    addImageText: { fontSize: 14, color: '#007AFF', marginLeft: 10, fontFamily: 'PlusJakartaSans-Regular' },
});