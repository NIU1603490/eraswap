import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTransactionStore } from "@/store/transaction-store";
import { useProductStore } from "@/store/product-store";
import { Transaction } from "@/services/types";
import { useUser } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { SharedHeaderStyles as HS } from "@/assets/styles/sharedStyles";

export default function ManagePurchasesScreen() {
  const { user } = useUser();
  const { transactions, isLoading, error, fetchTransactionsBySellerId, updateTransactionStatus } = useTransactionStore();
  const [selectedTab, setSelectedTab] = useState<'Pending' | 'Confirmed' | 'Completed' | 'Canceled'>('Pending');

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
  
  // Filter transactions based on selected tab
  // useMemo is used to optimize performance by memoizing the filtered transactions
  const filteredTransactions = useMemo (
    () => transactions.filter(transaction => transaction.status === selectedTab),
    [transactions, selectedTab]
  );

  useEffect(() => {
    if (user?.id) {
      fetchTransactionsBySellerId(user.id)
    }
  }, [fetchTransactionsBySellerId, user?.id]);

const changeStatus = useCallback(
    (txId: string, nextStatus: Transaction['status'], successMsg: string) => {
      Alert.alert(
        `Confirm ${nextStatus}`,
        `Are you sure you want to ${nextStatus.toLowerCase()} this?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                await updateTransactionStatus(txId, nextStatus);
                await fetchTransactionsBySellerId(user?.id || '');
                Alert.alert('Success', successMsg);
              } catch (err) {
                console.error(`Error updating status to ${nextStatus}:`, err);
                Alert.alert('Error', `Failed to ${nextStatus.toLowerCase()}.`);
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [updateTransactionStatus, fetchTransactionsBySellerId, user?.id]
  );

  // Render each transaction item
  // useCallback is used to prevent unnecessary re-renders and improve performance
  const renderTransactionItem = useCallback(
    ({ item }: { item: Transaction }) => {
      const { status, createdAt, product, buyer } = item;
      // Map status to label/color
      const statusMap = {
        Pending: { label: 'Pending', color: '#6B7280' },
        Confirmed: { label: 'Confirmed', color: '#3B82F6' },
        Completed: { label: 'Completed', color: '#10B981' },
        Canceled: { label: 'Canceled', color: '#EF4444' },
      }[status];

      return (
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.product.images?.[0] ?? undefined }}
            // defaultSource={require('@/assets/placeholder.png')}
            style={styles.productImage}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{item.product.title || 'Untitled Product'}</Text>
            <Text style={styles.subText}>
              Requested on {new Date(item.createdAt).toLocaleDateString('en-US')}
            </Text>
            <Text style={styles.subText}>
              Buyer: @{buyer.username || 'unknown'}
            </Text>
            <Text style={[styles.statusText, { color: statusMap.color }]}> 
              {statusMap.label}
            </Text>

            {/* Seller actions only for Pending */}
            {status === 'Pending' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.confirmBtn]}
                  onPress={() => changeStatus(item._id, 'Confirmed', 'Transaction confirmed, awaiting buyer completion')}
                >
                  <Text style={styles.actionText}>Confirm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => changeStatus(item._id, 'Canceled', 'Transaction declined successfully')}
                >
                  <Text style={[styles.actionText, styles.declineText]}>Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* No seller actions for Confirmed or Completed */}
            {status === 'Confirmed' && (
              <Text style={styles.infoNote}>Awaiting buyer to mark as received.</Text>
            )}

            {status === 'Completed' && (
              <Text style={styles.infoNote}>Transaction completed.</Text>
            )}
          </View>
        </View>
      );
    },
    [changeStatus]
  );

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={HS.loadingContainer}>
        <ActivityIndicator size="large" 
        />
        <Text style={HS.loadingText}>Loading transactions...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loader}>
        <Text style={HS.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchTransactionsBySellerId(user?.id || '')}>
          <Text style={styles.retry}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const tabs: Array<{ key: Transaction['status'], label: string }> = [
    { key: 'Pending', label: `Pending (${transactions.filter(t => t.status === 'Pending').length})` },
    { key: 'Confirmed', label: `Confirmed (${transactions.filter(t => t.status === 'Confirmed').length})` },
    { key: 'Completed', label: `Completed (${transactions.filter(t => t.status === 'Completed').length})` },
    { key: 'Canceled', label: `Canceled (${transactions.filter(t => t.status === 'Canceled').length})` },
  ];

  return (
  <SafeAreaView style={HS.container}>
      <View style={HS.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={HS.headerTitle}>Purchases</Text>
        <View style={{ width: 24 }} />
      </View>


      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setSelectedTab(tab.key)}>
            <Text style={[styles.tabText, selectedTab === tab.key && styles.tabSelected]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={  
          <View style={HS.emptyContainer}>
            <Text style={HS.emptyText}>No {selectedTab.toLowerCase()} purchase requests</Text>
          </View>
          }
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retry: { color: '#3D5AF1', fontSize: 14 },
  list: { padding: 16 },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  infoContainer: { flex: 1, justifyContent: 'space-between' },
  title: { fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 4 },
  subText: { fontSize: 12, fontFamily: 'PlusJakartaSans-Regular', color: '#6B7280' },
  statusText: { fontFamily: 'PlusJakartaSans-Bold', marginTop: 6 },
  actionsRow: { flexDirection: 'row', marginTop: 8, gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  confirmBtn: { backgroundColor: '#3B82F6' },
  declineBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EF4444' },
  actionText: { fontSize: 14, fontFamily: 'PlusJakartaSans-Bold', color: '#FFF' },
  declineText: { color: '#EF4444' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  detailText: { fontSize: 12, fontFamily: 'PlusJakartaSans-Regular', color: '#4B5563' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#FFF' },
  tabText: { fontSize: 14, fontFamily: 'PlusJakartaSans-Regular', color: '#6B7280' },
  tabSelected: { fontFamily: 'PlusJakartaSans-Bold', color: '#1F2937' },
  infoNote: { marginTop: 8, fontSize: 12, fontFamily: 'PlusJakartaSans-Regular', color: '#6B7280' },
    listContent: {
    padding: 16,
    paddingBottom: 20,
  },
});

// const styles = StyleSheet.create({

//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },


//   purchaseItem: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//     height: 180, // Alçada fixa per consistència
//   },
//   productImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 12,
//     marginRight: 16,
//   },
//   productInfoContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//   },
//   productInfo: {
//     flex: 1,
//   },
//   productTitle: {
//     fontSize: 16,
//     marginBottom: 8,
//     color: '#1F2937',
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   productPrice: {
//     fontSize: 14,
//     marginBottom: 8,
//     color: '#3D5AF1',
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   requestDate: {
//     fontSize: 12,
//     color: '#6B7280',
//     fontFamily: 'PlusJakartaSans-Regular',
//   },
//   statusText: {
//     fontSize: 14,
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   detailsContainer: {
//     marginTop: 4,
//   },
//   detailText: {
//     fontSize: 12,
//     color: '#6B7280',
//     fontFamily: 'PlusJakartaSans-Regular',
//     marginBottom: 4,
//   },
//   canceledStatus: {
//     position: 'absolute',
//     bottom: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: '#F3F4F6', // Gris clar
//     padding: 6,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   actionButtons: {
//     flexDirection: "row",
//     gap: 12,
//     marginTop: 12,
//   },
//   actionButton: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   acceptButton: {
//     backgroundColor: "#10B981",
//   },
//   declineButton: {
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#EF4444",
//   },
//   actionButtonText: {
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontFamily: 'PlusJakartaSans-Regular',
//   },
//   declineButtonText: {
//     color: "#EF4444",
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginBottom: 8,
//     color: "#4B5563",
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   emptySubtext: {
//     fontSize: 14,
//     textAlign: "center",
//     color: "#6B7280",
//     fontFamily: 'PlusJakartaSans-Regular',
//   },
//   errorText: {
//     fontSize: 16,
//     color: "#EF4444",
//     marginBottom: 10,
//     fontFamily: 'PlusJakartaSans-Regular',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     backgroundColor: "#3D5AF1",
//     borderRadius: 12,
//   },
//   retryButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     marginHorizontal: 15,
//     marginTop: 10,
//     paddingBottom: 5,
//   },
//   tabButton: {
//     paddingVertical: 10,
//     alignItems: 'center',
//   },
//   tabText: {
//     fontSize: 14,
//     fontFamily: 'PlusJakartaSans-Regular',
//     color: '#6B7280',
//   },
//   tabTextSelected: {
//     color: '#1F2937',
//     fontFamily: 'PlusJakartaSans-Bold',
//   },
//   tabUnderline: {
//     width: '100%',
//     height: 2,
//     backgroundColor: '#3D5AF1',
//     marginTop: 5,
//   },
//   buyerName: {
//     marginTop: 5,
//     fontFamily: 'PlusJakartaSans-Regular',
//   }
// });