import api from './api';
import { Conversation, Message } from './types';

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const res = await api.get(`/conversations/user/${userId}`);
  return res.data.conversations;
};

export const findOrCreateConversation = async (payload: {
  senderId: string;
  receiverId: string;
  productId?: string;
  initialMessage?: string;
}): Promise<Conversation> => {
  const res = await api.post('/conversations/create', payload);
  return res.data.conversation;
};

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const res = await api.get(`/messages/${conversationId}`);
  return res.data.messages;
};

export const sendMessage = async (payload: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  productId?: string;
}): Promise<Message> => {
  const res = await api.post('/messages', payload);
  return res.data.message;
};