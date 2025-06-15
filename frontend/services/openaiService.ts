// services/geminiService.ts
import api from './api'; // Asegúrate de que 'api' esté configurado correctamente, por ejemplo, con axios

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Modificamos para que reciba el ARRAY COMPLETO de ChatMessage
export const sendChatMessage = async (messages: ChatMessage[]): Promise<string> => {
  // Envía el array completo de mensajes al backend
  const response = await api.post('/ai', { messages });
  return response.data.reply ?? '';
};