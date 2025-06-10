import { create } from 'zustand';
import { Conversation, Message } from '@/services/types';
import * as chatService from '@/services/conversationService';

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
  createConversation: (payload: {
    senderId: string;
    receiverId: string;
    productId?: string;
    initialMessage?: string;
  }) => Promise<Conversation>;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await chatService.fetchConversations(userId);
      set({ conversations: data });
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await chatService.fetchMessages(conversationId);
      set({ messages: data });
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
      const msg = await chatService.sendMessage(payload);
      set((state) => ({ messages: [msg, ...state.messages] }));
      return msg;
    } catch (err: any) {
      console.error('Error sending message:', err);
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createConversation: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const conv = await chatService.createConversation(payload);
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
}));