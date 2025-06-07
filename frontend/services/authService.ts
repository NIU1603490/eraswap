//save user in database
import api from './api';
import { Country, City, University, Product, UserData, ProductData } from './types';

export const saveUser = async (userData: any): Promise<any> => {
  try {
    const response = await api.post('/users', userData);
    console.log('saveUser response:', JSON.stringify(response.data, null, 2));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to save user');
    }
    return response.data.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error creating user';
    console.error('Save user error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};

//getUser by clerkUserId
export const fetchUser = async (clerkUserId: string): Promise<UserData> => {
  try {
    const response = await api.get(`/users/user/${clerkUserId}`);
    console.log('fetchUser response:', JSON.stringify(response.data.user, null, 2));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
    return response.data.user;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching user';
    console.error('Fetch user error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      requestUrl: error.config?.url,
    });
    throw new Error(errorMessage);
  }
};

export const fetchObjectUser = async (userId: string): Promise<UserData> => {
  try {
    const response = await api.get(`/users/userObject/${userId}`);
    console.log('fetchUser response:', JSON.stringify(response.data.user, null, 2));
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
    return response.data.user;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error fetching user';
    console.error('Fetch user error:', {
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      requestUrl: error.config?.url,
    });
    throw new Error(errorMessage);
  }
};