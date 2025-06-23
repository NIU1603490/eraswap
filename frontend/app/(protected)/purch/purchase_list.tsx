/* Pantalla per veure les compres fetes per l'usuari*/

import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Transaction } from '@/services/types';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '@/store/transaction-store';
import { SharedHeaderStyles as HS } from '@/assets/styles/sharedStyles';

export default function PurchaseList() {
  const { user } = useUser();
  const router = useRouter();
  const {
    fetchTransactionsByBuyerId, updateTransactionStatus,
    isLoading, error, transactions } = useTransactionStore();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      try {
        fetchTransactionsByBuyerId(user.id);
      } catch (error: any) {
        console.error('Error fetching purchases:', error);
        Alert.alert('Error', 'Failed to load purchases');
      }
    };
    fetchData();
  }, [user?.id, fetchTransactionsByBuyerId]);

  const handleComplete = useCallback((txId: string) => {
    Alert.alert(
      'Confirm Delivery',
      'Have you received the product? Mark as completed.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await updateTransactionStatus(txId, 'Completed');
              await fetchTransactionsByBuyerId(user?.id || '');
              Alert.alert('Success', 'Purchase marked as completed.');
            } catch (err) {
              console.error('Error marking purchase completed:', err);
              Alert.alert('Error', 'Failed to mark as completed.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [updateTransactionStatus, fetchTransactionsByBuyerId, user?.id]);

  const deliveryConfig: Record<string, { label: string; style: any }> = {
    'delivery': { label: 'Home Delivery', style: styles.deliveryHome },
    'inPerson': { label: 'Pick Up', style: styles.deliveryPickup },
  };
  const paymentConfig: Record<string, { label: string; style: any }> = {
    'online': { label: 'Credit Card', style: styles.paymentCredit },
    'cash': { label: 'Cash', style: styles.paymentCash },
  };



  const renderPurchaseItem = useCallback(({ item }: { item: Transaction }) => {
    const createdAt = new Date(item.createdAt).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    const delivery = deliveryConfig[item.deliveryMethod] || { label: item.deliveryMethod, style: styles.badgeDefault };
    const payment = paymentConfig[item.paymentMethod] || { label: item.paymentMethod, style: styles.badgeDefault };

    const statusConfig = {
      Pending: { text: 'Pending', style: styles.statusPending },
      Confirmed: { text: 'Confirmed', style: styles.statusConfirmed },
      Completed: { text: 'Completed', style: styles.statusCompleted },
      Canceled: { text: 'Canceled', style: styles.statusCanceled },
    }[item.status];

    return (
      <View style={styles.purchaseItem}>
        <Image
          source={{ uri: item.product.images?.[0] ?? undefined }}
          // defaultSource={require('@/assets/placeholder.png')}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.title}>{item.product.title || 'Unknown Product'}</Text>
          <Text style={styles.text}>Requested on {createdAt}</Text>
          <Text style={styles.text}>Price: {item.price.amount} {item.price.currency}</Text>
          <Text style={styles.text}>Seller: @{item.seller.username}</Text>
          <View style={styles.row}>
            <View style={[styles.badge, delivery.style]}>
              <Text style={styles.badgeText}>{delivery.label}</Text>
            </View>
            <View style={[styles.badge, payment.style]}>
              <Text style={styles.badgeText}>{payment.label}</Text>
            </View>
          </View>
          <Text style={[styles.statusText, statusConfig.style]}>{statusConfig.text}</Text>

          {/* If confirmed, allow buyer to complete */}
          {item.status === 'Confirmed' && (
            <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item._id)}>
              <Text style={styles.completeBtnText} > Received </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [handleComplete]);

  if (isLoading || !fontsLoaded) {
    return (
      <View style={HS.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5AF1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={HS.errorContainer}>
        <Text style={HS.errorText}>Error loading purchases.</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={HS.container}>
      <View style={HS.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={HS.headerTitle}>Purchases</Text>
        <View style={{ width: 24 }} />
      </View>

      {transactions.length === 0 ? (
        <View style={HS.emptyContainer}>
          <Ionicons name="cart-outline" size={50} color="#6B7280" />
          <Text style={HS.emptyTitle}>You haven't made any purchases yet.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderPurchaseItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={HS.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  purchaseItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 80,
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    margin: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: 'center',
  },
  statusPending: { backgroundColor: '#FFF3CD', color: '#F59E0B' },
  statusConfirmed: { backgroundColor: '#DBEAFE', color: '#3B82F6' },
  statusCompleted: { backgroundColor: '#D1E7DD', color: '#10B981' },
  statusCanceled: { backgroundColor: '#F8D7DA', color: '#EF4444' },
  info: { flex: 1, padding: 10, justifyContent: 'center', gap: 4 },
  title: { fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 4 },
  text: { fontSize: 13, fontFamily: 'PlusJakartaSans-Regular', color: '#6B7280' },
  completeBtn: {
    marginTop: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 6,
    borderRadius: 8,
  },
  completeBtnText: { color: '#FFF', textAlign: 'center', fontFamily: 'PlusJakartaSans-Bold' },
  row: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF',
  },
  badgeDefault: {
    backgroundColor: '#6B7280',
  },
  deliveryHome: {
    backgroundColor: '#D1E7DD',
  },
  deliveryPickup: {
    backgroundColor: '#eedd98',
  },
  paymentCredit: {
    backgroundColor: '#b4d3fc',
  },
  paymentCash: {
    backgroundColor: '#fababa',
  },

});
