// controller/aiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY no está definida en el archivo .env");
    throw new Error('GEMINI_API_KEY no está definida. Por favor, configura tu archivo .env');
}
const genAI = new GoogleGenerativeAI(API_KEY);

const sendChat = async (req, res) => {
    console.log('API call received');
    try {
        const { messages } = req.body; 
        console.log("Recibido del frontend:", messages);

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('NO MESSAGES provided or empty array');
            return res.status(400).json({ error: "Se requiere un array de 'messages' en el cuerpo de la solicitud." });
        }

        let systemInstruction = null;
        let chatMessagesForHistory = []; // Aquí guardaremos solo los mensajes de 'user' y 'assistant'

        // Iterar sobre los mensajes para separar la instrucción del sistema
        messages.forEach(m => {
            if (m.role === 'system') {
                systemInstruction = { parts: [{ text: m.content }] };
            } else {
                // Mapea 'assistant' a 'model' y 'user' directamente
                chatMessagesForHistory.push({
                    role: m.role === 'assistant' ? 'model' : m.role,
                    parts: [{ text: m.content }],
                });
            }
        });

        // Asegúrate de que el último mensaje sea siempre del usuario para sendMessage
        const userPrompt = chatMessagesForHistory[chatMessagesForHistory.length - 1].parts[0].text;
        
        // El historial para 'startChat' debe contener todos los mensajes *excepto* el último del usuario
        // y *sin* el mensaje del sistema
        const historyWithoutLastUserPrompt = chatMessagesForHistory.slice(0, -1);

        // Obtener el modelo de Gemini
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // Pasa la instrucción del sistema aquí
            systemInstruction: systemInstruction 
        }); 

        // Iniciar una sesión de chat con el historial (que ahora no incluye el mensaje del sistema)
        const chat = model.startChat({
            history: historyWithoutLastUserPrompt, // Esto ahora empieza con 'user' o está vacío
            generationConfig: {
                maxOutputTokens: 500, 
            },
        });

        // Enviar solo el mensaje actual del usuario
        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        const reply = response.text();

        res.status(200).json({ success: true, reply });

    } catch (error) {
        console.error('Gemini error:', error.response?.data || error.message || error);
        
        let errorMessage = 'Error al contactar con la IA. Por favor, inténtalo de nuevo.';
        if (error.response && error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error.message;
            if (error.response.data.error.status === 'RESOURCE_EXHAUSTED') {
                errorMessage = 'Has excedido tu cuota de uso para Gemini. Por favor, intenta de nuevo más tarde o revisa tus límites.';
            } else if (error.response.data.error.code === 403) {
                 errorMessage = 'Error de autenticación: Tu clave de API puede ser inválida o no tener los permisos correctos.';
            } else if (error.response.data.error.message.includes("First content should be with role 'user', got system")) {
                errorMessage = "Error de configuración interna del chat. El mensaje del sistema no puede ser el primer mensaje en el historial del chat.";
            }
        } else if (error.message && error.message.includes("First content should be with role 'user', got system")) {
            errorMessage = "Error de configuración interna del chat. El mensaje del sistema no puede ser el primer mensaje en el historial del chat.";
        }

        res.status(500).json({ success: false, message: errorMessage });
    }
};

module.exports = { sendChat };