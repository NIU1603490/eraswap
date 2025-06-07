import api from "./api";
import { Transaction } from "./types";

export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
    try {
        const response = await api.post('/transactions/create', transaction);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to create purchase');
        }
        return response.data;
    } catch (error) {
        console.error('Error creating purchase:', error);
        throw error;
    }
};

export const fetchPurchases = async (userId: string): Promise<Transaction[]> => {
    console.log('fetchPurchases called with userId:', userId);
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const response = await api.get(`/transactions/user/${userId}`);
        console.log('response', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw error;
    }
};


