import { create } from 'zustand';
import api from '@/services/api';
import { User } from '@/services/types';

interface FollowState {
  followers: User[];
  following: User[];
  isLoading: boolean;
  error: string | null;
  fetchFollowers: (userId: string) => Promise<User[]>;
  fetchFollowing: (userId: string) => Promise<User[]>;
  followUser: (followerId: string, followingId: string) => Promise<void>;
  unfollowUser: (followerId: string, followingId: string) => Promise<void>;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  followers: [],
  following: [],
  isLoading: false,
  error: null,

  fetchFollowers: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/follows/followers/${userId}`);
      const followers = response.data.followers || [];
      set({ followers, isLoading: false });
      return followers;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchFollowing: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/follows/followings/${userId}`);
      const following = response.data.following || [];
      set({ following, isLoading: false });
      return following;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  followUser: async (followerId: string, followingId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/follows/follow/${followingId}`, { followerId });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/follows/unfollow/${followingId}`, { followerId });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));