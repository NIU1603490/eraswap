import { create } from 'zustand';
import api from '@/services/api';
import { Post } from '@/services/types';

interface PostState {
    posts: Post[];
    userPosts: Record<string, Post[]>;
    isLoading: boolean;
    error: string | null;

    fetchPosts: (countryId: string) => Promise<void>;
    fetchPostsByClerkId: (clerkUserId: string) => Promise<void>;
    addPost: (postData: any) => Promise<void>;
    updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
    likePost: (postId: string, userId: string) => Promise<void>;
    unlikePost: (postId: string, userId: string) => Promise<void>;
}


export const usePostStore = create<PostState>((set,get)=> ({
    posts: [],
    userPosts: {},
    isLoading: false,
    error: null,

    fetchPosts: async(countryId: string) => {
        set({ isLoading: true, error: null});
        try {
            const response = await api.get('/posts', {params: {countryId}});
            set({ posts: response.data.posts || response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }

    },

    fetchPostsByClerkId: async (clerkUserId: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/posts/user/${clerkUserId}`);
            set(state => ({ 
                userPosts: {
                    ...state.userPosts, // actualizar i mantenir els anteriors
                    [clerkUserId]: response.data.posts || [] }, //afegir nous posts a aquest usuari
                     isLoading: false }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addPost: async (postData) => {
        set({ isLoading: true});
        try {
            const response = await api.post('/posts/create', postData);
            if(response.data.success) {
                set(state => ({ posts: [response.data.post, ...state.posts] })); //coloca l'ultim post en primera posició de l'array
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            set({ isLoading: false });
        }
        
    },

    updatePost: async (id, updates) => {
        set({ isLoading: true});
        try {
            const response = await api.put(`/posts/update/${id}`, updates);
            if(response.data.success) {
                set(state => ({
                    posts: state.posts.map(p => (p._id === id ? response.data.post : p))
                }));
            }
        } catch (error) {
            console.error('Error updating post:', error);
        } finally {
            set({ isLoading: false });
        }
        
    },

    deletePost: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.delete(`/posts/delete/${id}`);
            if(response.data.success) {
                set(state => ({ posts: state.posts.filter(p => p._id !== id) }));
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            set({ isLoading: false });
        }
        
    },
    likePost: async (id) => {
        try {
            const response = await api.post(`/posts/like/${id}`);
            if(response.data.success) {
                set(state => ({ posts: state.posts.map(p => p._id === id ? response.data.post : p) }));
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
        
    },

    unlikePost: async (id) => {
        try {
            const response = await api.post(`/posts/unlike/${id}`);
            if(response.data.success) {
                set(state => ({ posts: state.posts.map(p => p._id === id ? response.data.post : p) }));
            }
        } catch (error) {
            console.error('Error unliking post:', error);
        }
        
    },

    // isLikedByUser: async (id, userId) => {

    // }

}))