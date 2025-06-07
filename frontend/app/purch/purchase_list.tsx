/*
  Pantalla per veure les compres fetes per l'usuari
*/

import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Transaction } from '@/services/types';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useTransactionStore } from '@/store/transaction-store';
import { useProductStore } from '@/store/product-store';

export default function PurchaseList() {
    const { user } = useUser();
    const router = useRouter();
    const { fetchTransactionsByBuyerId, isLoading: transactionLoading, error: transactionError, transactions: transactions } = useTransactionStore();
    const { fetchProductById } = useProductStore();
    const [purchases, setPurchases] = useState<Transaction[]>([]);
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
            const response = await fetchTransactionsByBuyerId(user.id);
            console.log('Purchases response:', response); // Debug log
          } catch (error: any) {
            console.error('Error fetching purchases:', error);
            Alert.alert('Error', 'Failed to load purchases: ' + (error.message || 'Unknown error'));
          }
        };
    
        fetchData();
      }, [user?.id]);

      useEffect(() => {
        if(transactions){
          setPurchases(transactions);
        }
      }, [transactions]);

    const renderPurchaseItem = ({ item }: { item: Transaction }) => {
        const createdAt = new Date(item.createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const statusStyle =
          item.status === 'Completed'
            ? styles.statusBought
            : item.status === 'Pending'
            ? styles.statusPending
            : styles.statusCanceled;
    
        return (
          <View>
            <TouchableOpacity
              style={styles.purchaseItem}
              // onPress={() => router.push(`/transaction/${item._id}`)}
            >
              <View style={styles.imagePlaceholder}>
              <Image source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.image} />
            </View>
              <View style={styles.purchaseInfo}>
                <Text style={styles.productTitle}>{item.product.title || 'Unknown Product'}</Text>
                <Text style={styles.dateText}>Requested the {createdAt}</Text>
                <Text style={[styles.statusText, statusStyle]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      };

    if(transactionLoading){
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D5AF1" />
        </View>
      );
    }

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchases</Text>
          <View style={{ width: 24 }} />
        </View>
  
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={50} color="#6B7280" />
            <Text style={styles.emptyText}>You haven't made any purchases yet.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderPurchaseItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      paddingTop: 20,
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
    backButton: {
      padding: 5,
    },
    headerTitle: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'PlusJakartaSans-Bold',
    },
    listContainer: {
      paddingHorizontal: 10,
      paddingVertical: 20,
    },
    purchaseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    imagePlaceholder: {
      width: 80,
      height: 80,
      backgroundColor: '#E5E7EB',
      borderRadius: 12,
      marginRight: 15,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
    },
    purchaseInfo: {
      flex: 1,
      gap: 8,
    },
    productTitle: {
      fontSize: 16,
      color: '#1F2937',
      fontFamily: 'PlusJakartaSans-Bold',
      marginBottom: 4,
    },
    dateText: {
      fontSize: 12,
      color: '#6B7280',
      fontFamily: 'PlusJakartaSans-Regular',
      marginBottom: 4,
    },
    statusText: {
      fontSize: 12,
      fontFamily: 'PlusJakartaSans-Bold',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      textAlign: 'center',
    },
    statusBought: {
      backgroundColor: '#D1E7DD',
      color: '#22C55E',
    },
    statusPending: {
      backgroundColor: '#D1E7DD',
      color: '#F59E0B',
    },
    statusCanceled: {
      backgroundColor: '#F8D7DA',
      color: '#EF4444',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#6B7280',
      fontFamily: 'PlusJakartaSans-Regular',
      marginTop: 10,
      textAlign: 'center',
    },
  });
