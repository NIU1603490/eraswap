import { create } from 'zustand';
import api from '@/services/api';
import { Country, City, University } from '@/services/types';

interface LocationState {
  countries: Country[];
  cities: City[];
  universities: University[];
  isLoading: boolean;
  error: string | null;
  fetchCountries: () => Promise<void>;
  fetchCities: (countryId: string) => Promise<void>;
  fetchUniversities: (cityId: string) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  countries: [],
  cities: [],
  universities: [],
  isLoading: false,
  error: null,

  fetchCountries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/locations/countries');
      if (response.data.success && response.data.data) {
        set({ countries: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch countries');
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchCities: async (countryId: string) => {
    set({ isLoading: true, error: null, cities: [] });
    try {
      const response = await api.get(`/locations/cities/${countryId}`);
      if (response.data.success && response.data.data) {
        set({ cities: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch cities');
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchUniversities: async (cityId: string) => {
    set({ isLoading: true, error: null, universities: [] });
    try {
      const response = await api.get(`/locations/universities/${cityId}`);
      if (response.data.success && response.data.data) {
        set({ universities: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.message || 'Failed to fetch universities');
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));