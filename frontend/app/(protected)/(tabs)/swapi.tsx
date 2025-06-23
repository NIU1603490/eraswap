// Swapi.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// CUIDADO: Cambia la importación para que apunte a geminiService
import { ChatMessage, sendChatMessage } from '@/services/openaiService'; // <- ¡Aquí!

export default function Swapi() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'Eres un asistente que ayuda a los usuarios de Eraswap.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg]; // El historial COMPLETO hasta ahora
    
    setMessages(updatedMessages); // Actualiza la UI inmediatamente con el mensaje del usuario
    setInput('');
    setLoading(true);

    try {
      // Envía el historial completo de mensajes al backend
      // El backend usará este historial para darle contexto a Gemini y añadir el nuevo mensaje del usuario
      const reply = await sendChatMessage(updatedMessages); 
      setMessages([...updatedMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error("Error al enviar mensaje a la IA:", err);
      // Muestra un mensaje de error más claro si hay un problema en la API
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error al contactar con la IA. Por favor, inténtalo de nuevo.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}> {/* Añade flex: 1 para que el ScrollView ocupe el espacio disponible */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
          {messages.filter(m => m.role !== 'system').map((msg, idx) => (
            <View key={idx} style={[styles.message, msg.role === 'user' ? styles.userMsg : styles.assistantMsg]}>
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))}
          {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingText} />} {/* Mejor ActivityIndicator */}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu mensaje"
            editable={!loading} // Deshabilita la entrada mientras carga
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', marginBottom:80, },
  chatArea: { flex: 1, padding: 10 }, // Añade flex: 1 para que el ScrollView crezca
  chatContent: { paddingBottom: 20 },
  message: { marginVertical: 4, padding: 10, borderRadius: 8, maxWidth: '80%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  assistantMsg: { alignSelf: 'flex-start', backgroundColor: '#F1F0F0' },
  messageText: { fontSize: 14 },
  loadingText: { alignSelf: 'center', marginVertical: 8 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc', alignItems: 'center' }, // Alinea los ítems verticalmente
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, marginRight: 8, minHeight: 40 }, // Altura mínima para la entrada
  sendButton: { backgroundColor: '#3D5AF1', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 20, minHeight: 40 },
  sendText: { color: '#fff', fontWeight: 'bold' },
});