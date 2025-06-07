import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { Transaction, TransactionData, User, Product } from '../services/types';

interface TransactionContextType {
  buyerTransactions: Transaction[];
  sellerTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  createTransaction: (transaction: TransactionData) => Promise<Transaction>;
  getBuyerTransactions: (userId: string) => Promise<void>;
  getSellerTransactions: (userId: string) => Promise<void>;
  updateTransactionStatus: (transactionId: string, status: 'accepted' | 'rejected') => Promise<void>;
  getTransactionById: (transactionId: string) => Promise<Transaction | null>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buyerTransactions, setBuyerTransactions] = useState<Transaction[]>([]);
  const [sellerTransactions, setSellerTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions where the user is the buyer
  const getBuyerTransactions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/user/${userId}`);
      setBuyerTransactions(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buyer transactions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions where the user is the seller
  const getSellerTransactions = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/seller/${userId}`);
      setSellerTransactions(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch seller transactions');
    } finally {
      setLoading(false);
    }
  };

  // Create a new transaction
  const createTransaction = async (transaction: TransactionData): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    try {
        const response = await api.post('/transactions/create', transaction);
        if (!response.data.success) {
            setError(response.data.message || 'Failed to create transaction');
        }
        return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create transaction');
      throw error;
    } finally {
      setLoading(false);
    }
};

  // Get a specific transaction by ID
  const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      return response.data || null;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transaction');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update transaction status (accept/reject)
  const updateTransactionStatus = async (transactionId: string, status: 'accepted' | 'rejected') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/transactions/${transactionId}/status`, { status });
      if (response.data.success) {
        const userId = response.data.data.buyer || response.data.data.seller;
        await getBuyerTransactions(userId);
        await getSellerTransactions(userId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: TransactionContextType = {
    buyerTransactions,
    sellerTransactions,
    loading,
    error,
    createTransaction,
    getBuyerTransactions,
    getSellerTransactions,
    updateTransactionStatus,
    getTransactionById,
  };

  return <TransactionContext.Provider value={contextValue}>{children}</TransactionContext.Provider>;
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};