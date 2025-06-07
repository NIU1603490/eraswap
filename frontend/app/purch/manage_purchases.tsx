import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useTransactionStore } from "@/store/transaction-store";
import { useProductStore } from "@/store/product-store";
import { Transaction } from "@/services/types";
import { useUser } from "@clerk/clerk-expo";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function ManagePurchasesScreen() {
  const { user } = useUser();
  const { transactions, fetchTransactionsBySellerId, isLoading, error, updateTransactionStatus } = useTransactionStore();
  const [selectedTab, setSelectedTab] = useState('Pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
  });
  
  // Filter transactions based on selected tab
  const filteredTransactions = transactions.filter(
    (transaction) => transaction.status === selectedTab
  );

  useEffect(() => {
    if (user?.id) {
      fetchTransactionsBySellerId(user.id)
    }
  }, [fetchTransactionsBySellerId, user?.id]);

  const handleAccept = async (transactionId: string) => {
    Alert.alert(
      'Confirm Accept',
      'Are you sure you want to accept this transaction?',
      [
        { text:'No', style: 'cancel'},
        { text: 'Yes',
          onPress: async () => {
            try {
              setIsUpdating(true);
              await updateTransactionStatus(transactionId, "Completed");
              //tornar a carregar les transaccions després d'actulitzar l'estat
              await fetchTransactionsBySellerId(user.id);
              Alert.alert('Success', 'Transaction accepted successfully');
            } catch (error) {
              console.error("Error accepting transaction:", error);
              Alert.alert('Error', 'Failed to accept transaction');
            } finally {
              setIsUpdating(false);
            }
          },
          style: 'default',
          },
      ], {cancelable: true}
    );

  };
  
  const handleDecline = async (transactionId: string) => {
    Alert.alert(
      'Confirm Decline',
      'Are you sure you want to decline this purchase?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              setIsUpdating(true); // Mostrar indicador de càrrega
              await updateTransactionStatus(transactionId, "Canceled");
              // Tornar a carregar les transaccions després d'actualitzar l'estat
              await fetchTransactionsBySellerId(user?.id || '');
              Alert.alert('Success', 'Transaction declined successfully');
            } catch (error) {
              console.error("Error declining transaction:", error);
              Alert.alert('Error', 'Failed to decline transaction');
            } finally {
              setIsUpdating(false); // Amagar indicador de càrrega
            }
          },
          style: 'default',
        },
      ],
      { cancelable: true }
    );
   
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isCompleted = item.status === 'Completed';
    const isCanceled = item.status === 'Canceled';
    const statusColor = isCompleted ? '#10B981' : isCanceled ? '#EF4444' : '#6B7280';
    const statusText = isCompleted ? 'Accepted' : isCanceled ? 'Canceled' : 'Pending';
    const paymentLabel = item.paymentMethod === 'cash' ? 'Cash' : item.paymentMethod === 'online' ? 'Online' : 'Not specified';
    const deliveryLabel = item.deliveryMethod === 'inPerson' ? 'In Person' : item.deliveryMethod === 'delivery' ? 'Delivery' : 'Not specified';

    return (
      <View style={styles.purchaseItem}>
        <Image
          source={{ uri: item.product.images[0] || 'https://via.placeholder.com/100' }}
          style={styles.productImage}
        />
        <View style={styles.productInfoContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{item.product.title || 'Untitled Product'}</Text>
            <Text style={styles.productPrice}>
              {item.price.amount} {item.price.currency}
            </Text>
            <Text style={styles.requestDate}>
              Requested on {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.buyerName}> Buyer: @{item.buyer.username || 'Unknown seller'}</Text>
          </View>
          {!isCanceled && (
            <View>
              {/* <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text> */}
              {isCompleted && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}> Payment method: {paymentLabel}</Text>
                  <Text style={styles.detailText}> Delivery method: {deliveryLabel}</Text>
                </View>
              )}
            </View>
          )}
          {!isCompleted && !isCanceled && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(item._id)}
                disabled={isLoading}
              >
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDecline(item._id)}
                disabled={isLoading}
              >
                <Text style={[styles.actionButtonText, styles.declineButtonText]}>
                  Decline
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isCanceled && (
            <View style={styles.canceledStatus}>
              <Text style={[styles.statusText, { color: '#EF4444' }]}>Canceled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTransactionsBySellerId(user?.id || '')}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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

      <View style={styles.tabContainer}>
        {['Pending', 'Completed', 'Canceled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextSelected,
              ]}
            >
              {tab} ({transactions.filter(t => t.status === tab).length})
            </Text>
            {selectedTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {selectedTab.toLowerCase()} purchase requests</Text>
          <Text style={styles.emptySubtext}>
            When someone wants to buy your product, it will appear here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  purchaseItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 180, // Alçada fixa per consistència
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  productInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  productPrice: {
    fontSize: 14,
    marginBottom: 8,
    color: '#3D5AF1',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular',
    marginBottom: 4,
  },
  canceledStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#F3F4F6', // Gris clar
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  declineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontFamily: 'PlusJakartaSans-Regular',
  },
  declineButtonText: {
    color: "#EF4444",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
    color: "#4B5563",
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: 'PlusJakartaSans-Regular',
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#3D5AF1",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: 15,
    marginTop: 10,
    paddingBottom: 5,
  },
  tabButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Regular',
    color: '#6B7280',
  },
  tabTextSelected: {
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  tabUnderline: {
    width: '100%',
    height: 2,
    backgroundColor: '#3D5AF1',
    marginTop: 5,
  },
  buyerName: {
    marginTop: 5,
    fontFamily: 'PlusJakartaSans-Regular',
  }
});