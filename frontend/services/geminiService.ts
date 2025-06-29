// services/geminiService.ts
import api from './api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  const response = await api.post('/ai', { messages });
  return response.data.reply ?? '';
};