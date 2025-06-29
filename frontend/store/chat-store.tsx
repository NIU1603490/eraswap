import { create } from 'zustand';
import api from '../services/api';
import { Conversation, Message } from '@/services/types';


interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (payload: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    productId?: string;
  }) => Promise<Message>;
  findOrCreateConversation: (payload: {
    senderId: string;
    receiverId: string;
    productId?: string;
    initialMessage?: string;
  }) => Promise<Conversation>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/conversations/user/${userId}`);
      set({ conversations: res.data.conversations });
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      set({ conversations: [], error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/messages/${conversationId}`);
      set({ messages: res.data.messages });
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/messages', payload);
      return res.data.message;
    } catch (err: any) {
      console.error('Error sending message:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  findOrCreateConversation: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/conversations/create', payload);
      const conv = res.data.conversation;
      set((state) => ({ conversations: [conv, ...state.conversations] }));
      return conv;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  deleteConversation: async (conversationId : string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/conversations/${conversationId}`);
      set((state)=> ({
        conversations: state.conversations.filter((c)=> c._id !== conversationId),
      }))
    } catch (err: any) {
      console.error('Error deleting conversation:', err);
      set({error: err.message});
    } finally {
      set({ isLoading: false});
    }
  },
}));