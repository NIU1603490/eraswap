import { create } from 'zustand';
import { useAuth, useUser } from '@clerk/clerk-expo';
import api from '@/services/api';
import { Country, City, University, Product, UserData, User, ProductData } from '@/services/types';

interface UserState {
  user: User | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserData>) => Promise<void>;
  saveUser: (userData: any) => Promise<any>;
  fetchUser: (clerkUserId: string) => Promise<User>;
  fetchObjectUser: (userId: string) => Promise<User>;
  addFavorite: (productId: string, clerkUserId: string) => Promise<void>;
  removeFavorite: (productId: string, clerkUserId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  // fetchFavoriteProducts: () => Promise<void>;
}

export const useUserStore = create<UserState>((set,get) => ({
  user: null,
  isLoading: false,
  error: null,
  selectedUser: null,

  updateProfile: async (updates: Partial<UserData>) => {
    set({ isLoading: true, error: null });
    try {
      const { user: clerkUser } = useUser();
      if (!clerkUser) throw new Error('User not authenticated');

      await clerkUser.update({
        firstName: updates.firstName || clerkUser.firstName,
        lastName: updates.lastName || clerkUser.lastName,
      });

      const response = await api.patch(`/users/${clerkUser.id}`, updates);

      set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  saveUser: async (userData: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users', userData);
      console.log('saveUser response:', JSON.stringify(response.data, null, 2));
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save user');
      }
      set((state) => ({
        user: response.data.data,
        isLoading: false,
      }));
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
        isLoading: false,
        user:  {
          ...response.data.user,
          savedProducts: response.data.user?.savedProducts || [],
        }});
      return response.data.user;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },

  fetchObjectUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/userObject/${userId}`);
      // console.log('fetchUser response:', JSON.stringify(response.data.user, null, 2));
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
      set({ 
        isLoading: false,
        selectedUser: response.data.user,
       });
      return response.data.user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching user';
      console.error('Fetch user error:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        requestUrl: error.config?.url,
      });
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },
  addFavorite: async (productId: string, clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/users/favorites/add', { productId, userId: clerkUserId });
      if (response.data.success) {
        set((state) => {
          const user = state.user;
          if (user) {
            return {
              user: {
                ...user,
                savedProducts: [...(user.savedProducts || []), response.data.product],
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
      const response = await api.delete(`/favorites/remove/${productId}`, {
        data: { userId: clerkUserId },
      });
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

  // fetchFavoriteProducts: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const { fetchProducts } = useProductStore();
  //     await fetchProducts(); // Carrega tots els productes
  //     const user = get().user;
  //     if (user?.savedProducts) {
  //       // Aquí pots filtrar els productes favorits si vols optimitzar
  //       // Per exemple: const favoriteProducts = allProducts.filter(p => user.savedProducts.includes(p._id));
  //     }
  //     set({ isLoading: false });
  //   } catch (error: any) {
  //     set({ error: error.message || 'Error fetching favorite products', isLoading: false });
  //     throw error;
  //   }
  // },
}));