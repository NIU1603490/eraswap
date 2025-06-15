import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useUser} from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { categories, conditions } from '@/assets/constants/constants';
import { useProductStore } from '@/store/product-store';
import { uploadImage } from '@/services/imageService';

// Format de les categories i condicions per al Dropdown
const categoryData = categories.map((cat) => ({ label: cat.name, value: cat.name }));
const conditionData = conditions.map((cond) => ({ label: cond.name, value: cond.name }));

export default function CreateProduct() {
  const router = useRouter();
  const { user } = useUser();
  const { createProduct } = useProductStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);


  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

    
  
  const handleCancel = () => {
    router.back();
  };

  const handlePublish = async () => {
    if (!title.trim() || !description.trim() || !category || !condition || !price || images.length === 0) {
      alert('Please fill all required fields, including at least one image.');
      return;
    }

    if (!user?.id) {
      alert('User not authenticated. Please sign in.');
      return;
    }

    const uploadedUrls: string[] = [];
    for (const uri of images) {
      try {
        const url = await uploadImage(uri);
        uploadedUrls.push(url);
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Failed to upload images');
        return;
      }

    } 

    const productData = { 
      title,
      description,
      price: parseFloat(price),
      category,
      condition,
      images: uploadedUrls,
      seller: user.id };


    try {
      console.log('Product data:', productData);
      const response = await createProduct(productData);
      console.log('Create product response:', response);
      if(response) {
        router.push('/home');
        alert('Product created successfully');
      }
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  const handleAddImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access media library is required to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
      console.log('Image selected:', result.assets[0].uri);
    } else {
      console.log('No images selected');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const isFormValid = title && description && category && condition && price && images.length > 0;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sellText}>Sell</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        <Text style={styles.prompt}>What are you selling?</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor="#666"
        />
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#666"
          multiline
        />
        <View style={styles.pickerContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={categoryData}
            labelField="label"
            valueField="value"
            placeholder="Select category"
            value={category}
            onChange={(item) => setCategory(item.value)}
            fontFamily="PlusJakartaSans-Regular"
            containerStyle={styles.dropdownContainer}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={conditionData}
            labelField="label"
            valueField="value"
            placeholder="Select condition"
            value={condition}
            onChange={(item) => setCondition(item.value)}
            fontFamily="PlusJakartaSans-Regular"
            containerStyle={styles.dropdownContainer}
          />
        </View>

        <TouchableOpacity style={styles.photoSection}>
          <Text style={styles.photoText}>Add photos</Text>
          <View style={styles.photoGrid}>
            {images.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoPlaceholder} />
                <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                  <Ionicons name="trash-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.photoPlaceholder} onPress={handleAddImages}>
                <Ionicons name="add" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.priceSection}>
          <Text style={styles.priceText}>Add price</Text>
          <TextInput
            style={styles.priceInput}
            value={price}
            onChangeText={setPrice}
            placeholder="Price"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
          <Text style={styles.currency}>EUR</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, (!isFormValid) && styles.disabledButton]}
          onPress={handlePublish}
          disabled={!isFormValid}
        >
          <Text style={[styles.buttonText, !isFormValid && styles.disabledButtonText]}>Publish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    fontSize: 14,
    color: 'red',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sellText: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
  },
  contentArea: {
    flex: 1,
    padding: 10,
    gap: 15,
  },
  prompt: {
    fontSize: 16,
    color: '#666',
    margin: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  dropdown: {
    height: 50,
    paddingHorizontal: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginTop: 5,
  },
  photoSection: {
    marginBottom: 10,
  },
  photoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  photoContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  currency: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    margin: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  disabledButtonText: {
    color: '#D3D3D3',
  },
});