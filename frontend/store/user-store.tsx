import { create } from 'zustand';
import { useAuth, useUser } from '@clerk/clerk-expo';
import api from '@/services/api';
import { Country, City, University, Product, UserData, User, ProductData } from '@/services/types';

interface UserState {
  user: User | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  favoriteProducts: Product[] | null;
  updateProfile: (clerkUserId: string, updates: Partial<UserData>) => Promise<void>;
  saveUser: (userData: any) => Promise<any>;
  fetchUser: (clerkUserId: string) => Promise<User>;
  fetchObjectUser: (userId: string) => Promise<User>;
  addFavorite: (productId: string, clerkUserId: string) => Promise<void>;
  removeFavorite: (productId: string, clerkUserId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  fetchFavoriteProducts: (clerkUserId: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  selectedUser: null,
  favoriteProducts: [],

  updateProfile: async (clerkUserId: string, updates: Partial<UserData>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/users/${clerkUserId}`, updates);
      set((state) => ({
        user: state.user ? { ...state.user, ...response.data.user } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  saveUser: async (userData: any) => {
    console.log('Saving user data:', userData);
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('users/create', userData);
      console.log('saveUser response:', JSON.stringify(response.data, null, 2));
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save user');
      }
      console.log('User:', response);
      set({
        user: response.data.data,
        isLoading: false,
      });
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error creating user';
      console.error('Save user error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  fetchUser: async (clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/user/${clerkUserId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
      set({
        user: {
          ...response.data.user,
          savedProducts: response.data.user?.savedProducts || [],
        }
      });
      return response.data.user;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    } finally {
      set({ isLoading: false});
    }
  },

  fetchObjectUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/userObject/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
      set({
        isLoading: false,
        selectedUser: { ...response.data.user },
      });
      return response.data.user;
    } catch (error: any) {
      console.error('Fetch user error:', error);
      set({ error: error, isLoading: false });
      throw new Error(error);
    } finally {
      set({ isLoading: false })
    }
  },
  addFavorite: async (productId: string, clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users/favorites/add', { productId, clerkUserId });
      if (response.data.success) {
        set((state) => {
          const user = state.user;
          if (user) {
            return {
              user: {
                ...user,
                savedProducts: [...(user.savedProducts || []), productId],
              },
              isLoading: false,
            };
          }
          return { isLoading: false };
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Error adding to favorites', isLoading: false });
      throw error;
    }
  },

  removeFavorite: async (productId: string, clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      // data should be sent in the body for DELETE requests
      const response = await api.delete('/users/favorites/remove', { data: { productId, clerkUserId } });
      if (response.data.success) {
        set((state) => {
          const user = state.user;
          if (user) {
            return {
              user: {
                ...user,
                savedProducts: (user.savedProducts || []).filter((p: string) => p !== productId),
              },
              isLoading: false,
            };
          }
          return { isLoading: false };
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Error removing from favorites', isLoading: false });
      throw error;
    }
  },

  isFavorite: (productId: string) => {
    const user = get().user;
    return (user?.savedProducts || []).some((p: string) => p === productId);

  },

  fetchFavoriteProducts: async (clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/favorites/${clerkUserId}`);
      console.log('Fetched favorite products:', response.data.favorites);
      set({ favoriteProducts: response.data.favorites || [], isLoading: false });

    } catch (error: any) {
      set({ error: error.message || 'Error fetching favorite products', isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));