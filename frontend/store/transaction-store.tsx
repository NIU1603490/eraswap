import { create } from 'zustand';
import { Transaction, TransactionData } from '@/services/types';
import api from '@/services/api';

interface TransactionState {
    transactions: Transaction[];
    selectedTransaction: Transaction | null;
    isLoading: boolean;
    error: string | null;
    fetchTransactionsByBuyerId: (userId: string) => Promise<Transaction[]>;
    fetchTransactionsBySellerId: (userId: string) => Promise<Transaction[]>;
    createTransaction: (transactionData: TransactionData) => Promise<Transaction>;
    updateTransactionStatus: (transactionId: string, status: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    selectedTransaction: null,
    isLoading: false,
    error: null,


    fetchTransactionsByBuyerId: async (userId: string): Promise<Transaction[]> => {
        console.log('fetchPurchases called with userId:', userId);
        set({ isLoading: true, error: null });
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const response = await api.get(`/transactions/buyer/${userId}`);
            console.log('response', response.data.data);
            set({ transactions: response.data.data });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching purchases:', error);
            set({ isLoading: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }

    },

    fetchTransactionsBySellerId: async (userId: string): Promise<Transaction[]> => {
        console.log('fetchPurchases called with userId:', userId);
        set({ isLoading: true, error: null });
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            const response = await api.get(`/transactions/seller/${userId}`);
            console.log('response', response.data.data);
            set({ transactions: response.data.data });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching purchases:', error);
            set({ isLoading: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }

    },

    createTransaction: async (transactionData: TransactionData): Promise<Transaction> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/transactions/create', transactionData);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to create purchase');
            }
            return response.data.success;
        } catch (error) {
            set({ isLoading: false });
            console.error('Error creating purchase:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTransactionStatus: async (transactionId: string, status: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put(`/transactions/update/${transactionId}`, { status });
            if (response.data.success) {
                console.log('Transaction status updated successfully');
            } else {
                throw new Error(response.data.message || 'Failed to update transaction');
            }
        } catch (error) {
            set({ error: 'Failed to update transaction status' });
            console.error('Error updating transaction:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}))