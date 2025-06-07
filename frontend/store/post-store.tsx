import { create } from 'zustand';
import api from '@/services/api';
import { Post } from '@/services/types';

interface PostState {
    posts: Post[];
    userPosts: Record<string, Post[]>;
    isLoading: boolean;
    error: string | null;

    fetchPosts: () => Promise<void>;
    addPost: (post: Post) => void;
    updatePost: (id: string, updates: Partial<Post>) => void;
    deletePost: (id: string) => void;
    likePost: (postId: string, userId: string) => void;
    unlikePost: (postId: string, userId: string) => void;
    
}


export const usePostStore = create<PostState>((set)=> ({
    posts: [],
    userPosts: {},
    isLoading: false,
    error: null,

    fetchPosts: async() => {
        set({ isLoading: true});
        try {
            
        } catch (error) {
            
        }

    },

    addPost: async (post) => {
        set({ posts: [post, ...get().posts] });
        
    },

    updatePost: async (post) => {
        set({ posts: [post, ...get().posts] });
        
    },

    deletePost: async (post) => {
        set({ posts: [post, ...get().posts] });
        
    },
    likePost: async (post) => {
        set({ posts: [post, ...get().posts] });
        
    },

    unlikePost: async (post) => {
        set({ posts: [post, ...get().posts] });
        
    },

}))