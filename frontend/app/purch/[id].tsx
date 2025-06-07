import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { UserData, TransactionData, Product } from '@/services/types';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useFonts } from 'expo-font';

import { useUser } from '@clerk/clerk-expo';
import { useProductStore } from '@/store/product-store';
import { useTransactionStore } from '@/store/transaction-store';
import { fetchObjectUser } from '@/services/authService';

export default function PurchaseProcessScreen() {
  const { id, sellerId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { fetchProductById, selectedProduct, isLoading: productLoading, error: productError } = useProductStore();
  const { createTransaction, isLoading: transactionLoading } = useTransactionStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<UserData | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'inPerson' | 'delivery'>('inPerson');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [messageToSeller, setMessageToSeller] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingTime, setMeetingTime] = useState(new Date());
  const [meetingLocation, setMeetingLocation] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  // DateTime Picker handlers
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleDateConfirm = (date: Date) => {
    setMeetingDate(date);
    hideDatePicker();
  };

  const showTimePicker = () => setTimePickerVisibility(true);
  const hideTimePicker = () => setTimePickerVisibility(false);
  const handleTimeConfirm = (time: Date) => {
    setMeetingTime(time);
    hideTimePicker();
  };

  const handleConfirmPurchase = async () => {
    if (!product || !user?.id || !sellerId) {
      Alert.alert('Error', 'Missing required data to proceed with purchase.');
      return;
    }
    if (deliveryMethod === 'inPerson' && (!meetingDate || !meetingTime || !meetingLocation)) {
      Alert.alert('Missing Information', 'Please select a date, time, and location for the meeting.');
      return;
    }

    const transactionData: TransactionData = {
      buyer: user.id,
      product: id as string,
      seller: sellerId as string,
      price: product.price || { amount: 0, currency: 'NOK' },
      status: 'Pending',
      paymentMethod,
      deliveryMethod,
      meetingDate,
      meetingTime: meetingTime?.toLocaleTimeString() || '',
      meetingLocation,
      messageToSeller,
    };

    try {
      const transaction = await createTransaction(transactionData);
      if (transaction) {
        console.log('Transaction created:', transaction);
        Alert.alert(
          'Purchase Initiated!',
          'Your request has been sent to the seller. You can now chat with them to finalize details.',
          [
            { text: 'OK', onPress: () => router.push('/purch/purchase_list') },
            { text: 'Chat', onPress: () => router.push('/home') },
          ]
        );
      } else {
        console.error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to initiate purchase. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !sellerId) {
        Alert.alert('Error', 'Missing product or seller information.');
        return;
      }

      try {
        await fetchProductById(id as string);
        if (selectedProduct) {
          console.log('Selected Product:', selectedProduct);
          setProduct(selectedProduct);
          const userResponse = await fetchObjectUser(selectedProduct.seller);
          if (userResponse) {
            console.log('Fetched Seller:', userResponse);
            setSeller(userResponse);
          } else {
            throw new Error('Seller not found');
          }
        } else {
          throw new Error('Product not found in store');
        }
      } catch (error) {
        console.error('Error fetching product or seller:', error);
        Alert.alert('Error', 'Failed to load product or seller details.');
      }
    };
    fetchData();
  }, [id, sellerId, fetchProductById]);

  const isLoading = !fontsLoaded || productLoading || transactionLoading;
  const hasError = productError || !product || !seller;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3D5AF1" />
        </View>
      </SafeAreaView>
    );
  }

  // if (hasError) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //         <Text style={styles.errorText}>Failed to load product or seller. Please try again later.</Text>
  //         <TouchableOpacity style={styles.retryButton} onPress={() => fetchProductById(id as string)}>
  //           <Text style={styles.retryButtonText}>Retry</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  console.log('Rendering PurchaseProcessScreen:', { product, seller });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalize Purchase</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.productSummaryContainer}>
            {product?.images && product.images.length > 0 ? (
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
            ) : (
              <Text style={styles.placeholderText}>No image available</Text>
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>{product?.title || 'No title available'}</Text>
              <Text style={styles.productPrice}>
                {product?.price ? `${product.price.amount} ${product.price.currency}` : 'Price not available'}
              </Text>
              <Text style={styles.statusText}>
                Status: {product?.status || 'available'}
              </Text>
              <View style={styles.sellerRow}>
                {seller?.profilePicture ? (
                  <Image source={{ uri: seller.profilePicture }} style={styles.sellerImageSmall} />
                ) : (
                  <Text style={styles.placeholderText}>No profile pic</Text>
                )}
                <Text style={styles.sellerNameSmall}>{seller?.username || 'Unknown seller'}</Text>
              </View>
            </View>
            </View>
          <Text style={styles.sectionTitle}>Delivery Method</Text>
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[styles.optionButton, deliveryMethod === 'inPerson' && styles.optionButtonSelected]}
              onPress={() => setDeliveryMethod('inPerson')}
            >
              <Ionicons name="location-outline" size={20} color={deliveryMethod === 'inPerson' ? '#fff' : '#3D5AF1'} style={styles.optionIcon} />
              <Text style={[styles.optionText, deliveryMethod === 'inPerson' && styles.optionTextSelected]}>Meet in person</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, deliveryMethod === 'delivery' && styles.optionButtonSelected]}
              onPress={() => setDeliveryMethod('delivery')}
            >
              <Ionicons name="location-outline" size={20} color={deliveryMethod === 'delivery' ? '#fff' : '#3D5AF1'} style={styles.optionIcon} />
              <Text style={[styles.optionText, deliveryMethod === 'delivery' && styles.optionTextSelected]}>Delivery</Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'inPerson' && (
            <>
              <Text style={styles.subSectionTitle}>Arrange Meeting</Text>
              <TouchableOpacity onPress={showDatePicker} style={styles.inputField}>
                <Text style={styles.inputText}>{meetingDate.toDateString()}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
              />
              <TouchableOpacity onPress={showTimePicker} style={styles.inputField}>
                <Text style={styles.inputText}>{meetingTime.toLocaleTimeString()}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleTimeConfirm}
                onCancel={hideTimePicker}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Suggest Meeting Location (e.g., Campus Library)"
                value={meetingLocation}
                onChangeText={setMeetingLocation}
              />
            </>
          )}
        

        
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[styles.optionButton, paymentMethod === 'cash' && styles.optionButtonSelected]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cash' ? '#fff' : '#3D5AF1'} style={styles.optionIcon} />
              <Text style={[styles.optionText, paymentMethod === 'cash' && styles.optionTextSelected]}>Cash on pickup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, paymentMethod === 'online' && styles.optionButtonSelected]}
              onPress={() => setPaymentMethod('online')}
            >
              <Ionicons name="cash-outline" size={20} color={paymentMethod === 'online' ? '#fff' : '#3D5AF1'} style={styles.optionIcon} />
              <Text style={[styles.optionText, paymentMethod === 'online' && styles.optionTextSelected]}>Online Payment</Text>
            </TouchableOpacity>
          </View>
        

        
          <Text style={styles.sectionTitle}>Message to Seller (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write a message to the seller..."
            value={messageToSeller}
            onChangeText={setMessageToSeller}
            multiline
            numberOfLines={3}
          />
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Product Price:</Text>
              <Text style={styles.summaryValue}>
                {product?.price ? `${product.price.amount} ${product.price.currency}` : 'Price not available'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.summaryLabel, styles.totalLabel]}>Total to Pay: </Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>
                {product?.price ? `${product.price.amount} ${product.price.currency}` : 'Price not available'}
              </Text>
            </View>
          </View>
        <Text style={styles.policyText}>
          By confirming, you agree to Eraswap's Terms & Conditions and Privacy Policy.
        </Text>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPurchase}>
          <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 5 },
  headerTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#3D5AF1',
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerImageSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  sellerNameSmall: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subSectionTitle: {
    fontSize: 14,
    color: '#374151',
    marginTop: 10,
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  optionGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#F9FAFB',
  },
  optionButtonSelected: {
    backgroundColor: '#3D5AF1',
    borderColor: '#3D5AF1',
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  inputField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 10,
    justifyContent: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  inputText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  textArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 15,
    textAlignVertical: 'top',
    minHeight: 80,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summarySection: {
    marginTop: 10,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  totalValue: {
    fontSize: 16,
    marginBottom: 10,
    color: '#3D5AF1',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  policyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  confirmButton: {
    backgroundColor: '#22C55E',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'PlusJakartaSans-Bold',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#3D5AF1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
});