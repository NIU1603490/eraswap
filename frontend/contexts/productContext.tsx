import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api'; // Import the simplified api
import { Product, ApiResponse } from '../services/types';
//import { CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from '@env';

interface ProductContextType {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  createProduct: (productData: any, images: any[]) => Promise<Product>;
  getProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product>;
  updateProduct: (id: string, productData: any) => Promise<void>;
  deleteProduct: (productId: string, userId: string) => Promise<void>;
  getProductByUser: (clerkUserId: string) => Promise<Product[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      throw new Error(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const createProduct = async (productData : any)  => {
    try {
      const response = await api.post('/products/create', productData);
      console.log('Create product response:', JSON.stringify(response.data, null, 2));
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create product');
      }
      return response.data.data;
    } catch (error) {
      const errorMessage = 'Save product error:';
      console.error('Save product error:');
      throw new Error(errorMessage);
      
    }
  
  };

  // const createProduct = async (productData: any, images: any[]): Promise<Product> => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const uploadedImageUrls: string[] = [];
  //     for (const image of images) {
  //       const formData = new FormData();
  //       formData.append('file', {
  //         uri: image.uri,
  //         type: image.type || 'image/jpeg',
  //         name: image.fileName || 'product_image.jpg',
  //       });
  //       formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  //       formData.append('folder', 'products');

  //       const uploadResponse = await axios.post(CLOUDINARY_URL, formData, {
  //         headers: { 'Content-Type': 'multipart/form-data' },
  //       });
  //       uploadedImageUrls.push(uploadResponse.data.secure_url);
  //     }

  //     const productWithImages = { ...productData, images: uploadedImageUrls };
  //     const response = await api.post('/products/create', productWithImages);
  //     if (!response.data.success) {
  //       throw new Error(response.data.message || 'Failed to create product');
  //     }
  //     const createdProduct = response.data.data;
  //     setProducts((prev) => [...prev, createdProduct]);
  //     return createdProduct;
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to create product');
  //     throw new Error(err.message || 'Failed to create product');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getProductByUser = async (clerkUserId: string): Promise<Product[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/get/${clerkUserId}`);
      const userProducts = response.data.products;
      setProducts(userProducts);
      return userProducts;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user products');
      throw new Error(err.message || 'Failed to fetch user products');
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id: string): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.product;
      setCurrentProduct(product);
      return product;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product');
      throw new Error(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: string, productData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/products/${id}`, productData);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...productData } : p))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
      throw new Error(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/products/delete/${productId}`, { userId });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
      throw new Error(err.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: ProductContextType = {
    products,
    currentProduct,
    loading,
    error,
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductByUser,
  };

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>;
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};