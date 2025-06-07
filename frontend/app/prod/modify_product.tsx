import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import { categories, conditions } from '@/assets/constants/constants';
import { useProductStore } from '@/store/product-store';
import { Product } from '@/services/types';

const categoryData = categories.map((cat) => ({ label: cat.name, value: cat.name }));
const conditionData = conditions.map((cond) => ({ label: cond.name, value: cond.name }));

export default function ModifyProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { updateProduct, fetchProductById, selectedProduct, isLoading : loading, error } = useProductStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);



  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  // Populate form fields when product is loaded
  useEffect(() => {
    if (selectedProduct) {
      setTitle(selectedProduct.title || '');
      setDescription(selectedProduct.description || '');
      setCategory(selectedProduct.category || '');
      setCondition(selectedProduct.condition || '');
      setPrice(selectedProduct.price?.amount?.toString() || '');
      setImages(selectedProduct.images || []);
    }
  }, [selectedProduct]);

  // Fetch product by id
  useEffect(() => {
    if (id) {
      fetchProductById(id as string).catch((error) => {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product details');
      });
    }
  }, [fetchProductById, id]);

  // Track unsaved changes
  useEffect(() => {
    if (selectedProduct) {
      const hasChanges = 
        title !== (selectedProduct.title || '') ||
        description !== (selectedProduct.description || '') ||
        category !== (selectedProduct.category || '') ||
        condition !== (selectedProduct.condition || '') ||
        price !== (selectedProduct.price?.amount?.toString() || '') ||
        JSON.stringify(images) !== JSON.stringify(selectedProduct.images || []);
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, description, category, condition, price, images, selectedProduct]);

  // Form validation
  const isFormValid = () => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      category.length > 0 &&
      condition.length > 0 &&
      price.length > 0 &&
      !isNaN(parseFloat(price)) &&
      parseFloat(price) > 0 &&
      images.length > 0
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleUpdate = async () => {
    console.log('Starting update process...');
    console.log('Product ID:', id);
    console.log('Form data:', { title, description, category, condition, price, images });
    
    const updates = {
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      price: { amount: parseFloat(price) },
      images
    };
    
    console.log('Sending updates:', updates);
    
    try {
      const result = await updateProduct(id as string, updates as Partial<Product>);
      console.log('Update result:', result);
      Alert.alert(
        'Changes saved succesfully',
        '',
        [
          { text: 'OK', onPress: () => router.replace('/home') }
        ]
      );
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleAddImages = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum Images', 'You can only add up to 5 images.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Permission to access media library is required to upload images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImages([...images, result.assets[0].uri]);
      console.log('Image selected:', result.assets[0].uri);
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setImages(images.filter((_, i) => i !== index))
        }
      ]
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading product</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sellText}>Edit Product</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentArea}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter product title"
              placeholderTextColor="#666"
              maxLength={100}
            />
            
            <Text style={styles.fieldLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your product"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category & Condition</Text>
            
            <Text style={styles.fieldLabel}>Category *</Text>
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

            <Text style={styles.fieldLabel}>Condition *</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({images.length}/5) *</Text>
            <Text style={styles.sectionSubtitle}>Add up to 5 photos of your product</Text>
            
            <View style={styles.photoGrid}>
              {images.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photoImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {images.length < 5 && (
                <TouchableOpacity style={styles.photoPlaceholder} onPress={handleAddImages}>
                  <Ionicons name="camera" size={32} color="#666" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            
            <Text style={styles.fieldLabel}>Price *</Text>
            <View style={styles.priceSection}>
              <TextInput
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <Text style={styles.currency}>NOK</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!isFormValid() || isLoading) && styles.disabledButton
          ]}
          onPress={handleUpdate}
          disabled={!isFormValid() || isLoading}
        >
          <Text style={[
            styles.buttonText,
            (!isFormValid() || isLoading) && styles.disabledButtonText
          ]}>
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sellText: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  contentArea: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#666',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  dropdown: {
    height: 54,
    paddingHorizontal: 16,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E7',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 4,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Regular',
    backgroundColor: '#FAFAFA',
    marginRight: 12,
  },
  currency: {
    fontSize: 18,
    color: '#007AFF',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  disabledButton: {
    backgroundColor: '#E5E5E7',
  },
  disabledButtonText: {
    color: '#999',
  },
});