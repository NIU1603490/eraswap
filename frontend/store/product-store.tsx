import { create } from 'zustand';
import { useAuth } from '@clerk/clerk-expo';
import { Product, ProductData } from '@/services/types';
import api from '@/services/api';


interface ProductState {
  products: Product[];
  userProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (clerkUserId: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  fetchProductsByClerkId: (clerkUserId: string) => Promise<void>;
  createProduct: (productData: ProductData) => Promise<any>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string, clerkUserId: string) => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  userProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,


  fetchProducts: async (clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/products/${clerkUserId}`);
      set({ products: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null, selectedProduct: null });
    try {
      const response = await api.get(`/products/id/${id}`);
      set({ selectedProduct: response.data.product || response.data, isLoading: false });
      console.log('Selected Product:', response.data.product);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchProductsByClerkId: async (clerkUserId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/products/my/${clerkUserId}`);
      set({  userProducts: response.data.products || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProduct: async (productData: ProductData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Create product data:', { ...productData});
      const response = await api.post('/products/create', { ...productData});
      console.log('Create product response:', response.data);
      if(response.data.success) {
        set((state) => ({
          products: [...state.products, response.data.product], //crea una copia de l'estat actual i afegeix el nou producte
          isLoading: false,
        }));
      }
      return response;
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

updateProduct: async (id: string, updates: Partial<Product>) => {
  try {
    const response = await api.put(`/products/update/${id}`, updates);

    if(response.data.success) {
      console.log('Update product response:', response.data);
      set(state => ({
        products: state.products.map(p => p._id === id ? response.data.product : p),
        selectedProduct: response.data.product  // También actualiza el producto seleccionado
      }));
    }
  
    return response.data.product;
  } catch (error) {
    console.error('Update product error:', error);
    throw error; // Re-lanza el error para que se pueda manejar en el componente
  }
},

  deleteProduct: async (productId: string, clerkUserId: string) => {
    try {
      set({ isLoading: true, error: null});
      const response = await api.delete(`/products/delete/${productId}`, {
        data: { userId: clerkUserId },
      });

      if(response.data.success) {
        set((state) => ({
          //update eliminant el producte eliminat 
          products: state.products.filter((p) => p._id !== productId),
          isLoading: false,
          error: null,
        }));
      }
      
    } catch (error: any) {
      console.error('Error deleting product:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setSelectedProduct: (product: Product | null) => {
    set({ selectedProduct: product });
  },
}));