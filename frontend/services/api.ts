///services/api.ts
import axios, { AxiosResponse } from 'axios';
import { Platform } from 'react-native';

//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.65:5000/api';
//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.217.136:5000/api';
//const BASE_URL = 'http://10.0.2.2:5000/api'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
//const BASE_URL = 'https://eraswap.onrender.com/api'



console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000,
});



// // Add Clerk token for authentication
// api.interceptors.request.use(async (config) => {
//   try {
//     const { getToken } = require('@clerk/clerk-expo').useAuth();
//     const token = await getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (err) {
//     console.error('Failed to attach Clerk token:', err);
//   }
//   return config;
// });

// Basic error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Network error: Unable to reach server';
    return Promise.reject(new Error(message));
  }
);

export default api;