///services/api.ts
import axios, { AxiosResponse } from 'axios';
import { fetchAuthToken } from './authToken';


//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.137.65:5000/api';
//const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.1.217.136:5000/api';
//const BASE_URL = 'http://10.0.2.2:5000/api'

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
//const BASE_URL = 'https://eraswap.onrender.com/api'

const DEFAULT_BASE_URL = 'http://localhost:5000/api';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

console.log('API Base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 100000,
});


// // Add Clerk token for authentication
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Attach latest Clerk token before each request
api.interceptors.request.use(async (config) => {
  const token = await fetchAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

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