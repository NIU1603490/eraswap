import api from './api';
import { Country, City, University, Product, UserData, ProductData } from './types';
import { AxiosResponse } from 'axios';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const fetchCountries = async (): Promise<Country[]> => {
  console.log('fetchCountries called from:', new Error().stack);
  try {
    const response: AxiosResponse<ApiResponse<Country[]>> = await api.get('/locations/countries');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch countries');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Fetch countries error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch countries');
  }
};

export const fetchCities = async (countryId: string): Promise<City[]> => {
  try {
    const response: AxiosResponse<ApiResponse<City[]>> = await api.get(`/locations/cities/${countryId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch cities');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Fetch cities error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cities');
  }
};

export const fetchUniversities = async (cityId: string): Promise<University[]> => {
  try {
    const response: AxiosResponse<ApiResponse<University[]>> = await api.get(`/locations/universities/${cityId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch universities');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Fetch universities error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch universities');
  }
};








