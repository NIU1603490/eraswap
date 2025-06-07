import api from './api';
import { Country, City, University, Product, UserData, ProductData } from './types';

export const createProduct = async (productData : any)  => {
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


export const getProductByUser = async (clerkUserId: string)  => {
  try {
    const response = await api.get(`/products/get/${clerkUserId}`)
    //console.log('Create product response:', response.data);
    return response.data.products; // extract the products array
  } catch (error) {
    console.error('Save product error:',error);
    throw error;
  }

}

export const getProducts = async ()  => {
  try {
    const response = await api.get('/products');
    //console.log('Get products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get products error:',error);
    throw error;
  }
}

export const getProductById = async (id: string): Promise<Product> => {
  try {
    console.log('location api:')
    const response = await api.get(`/products/${id}`);
    //console.log('Get product response:', response.data);
    console.log('Get product response:', response.data.product);
    return response.data.product; 
  } catch (error) {
    console.error('Error product:',error);
    throw error; 
  }
  
};

export const updateProduct = async (id: string, productData: any) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
}
};


export const deleteProduct = async (productId: string, userId: string) : Promise<any> => {
  try {
    const response = await api.put(`/products/delete/${productId}`, {userId});
    console.log('Delete product response:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}