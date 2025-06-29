// controller/aiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined .env");
    throw new Error('GEMINI_API_KEY is not defined. Please, configure the file .env');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const sendChat = async (req, res) => {
    console.log('API call received');
    try {
        const { messages } = req.body; 
        console.log("Recived from frontend:", messages);

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('NO MESSAGES provided or empty array');
            return res.status(400).json({ error: "An array of messages is required" });
        }

        let systemInstruction = null;
        let chatMessagesForHistory = []; // messages of 'user' and 'assistant'

        messages.forEach(m => {
            if (m.role === 'system') {
                systemInstruction = { parts: [{ text: m.content }] };
            } else {
                // 'assistant' --> 'model'
                chatMessagesForHistory.push({
                    role: m.role === 'assistant' ? 'model' : m.role,
                    parts: [{ text: m.content }],
                });
            }
        });

        // take the last message of the user
        const userPrompt = chatMessagesForHistory[chatMessagesForHistory.length - 1].parts[0].text;
        
        // to'startChat' we need all the messages except the last message of the user
        const historyWithoutLastUserPrompt = chatMessagesForHistory.slice(0, -1);

        // specify the gemini model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction 
        }); 

        //start conversation without the system message
        const chat = model.startChat({
            history: historyWithoutLastUserPrompt,
            generationConfig: {
                maxOutputTokens: 500, 
            },
        });

        //send only the last message of the user
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
                errorMessage = 'You have exceeded your usage quota for Gemini. Please try again later or check your limits.';
            } else if (error.response.data.error.code === 403) {
                 errorMessage = 'Authentication error: Your API key may be invalid or lack the necessary permissions.';
            } else if (error.response.data.error.message.includes("First content should be with role 'user', got system")) {
                errorMessage = "Internal chat configuration error. The system message cannot be the first message in the chat history.";
            }
        } else if (error.message && error.message.includes("First content should be with role 'user', got system")) {
            errorMessage = "Internal chat configuration error. The system message cannot be the first message in the chat history.";
        }

        res.status(500).json({ success: false, message: errorMessage });
    }
};

module.exports = { sendChat };