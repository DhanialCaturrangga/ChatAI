require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store conversation history (in production, use a database)
const conversationHistory = new Map();

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Kamu adalah AI assistant yang ramah dan helpful. Kamu adalah bagian dari aplikasi ChatAI mobile. 
Jawab dengan bahasa yang sama dengan user (jika user berbahasa Indonesia, jawab dalam Bahasa Indonesia).
Berikan jawaban yang informatif, singkat, dan mudah dipahami.
Gunakan emoji secara natural untuk membuat percakapan lebih hidup.`;

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ChatAI Backend is running! 🚀' });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Get or create conversation history
        if (!conversationHistory.has(conversationId)) {
            conversationHistory.set(conversationId, []);
        }
        const history = conversationHistory.get(conversationId);

        // Use gemini-2.0-flash model (fast and capable)
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT
        });

        // Build conversation context
        const conversationContext = history.map(msg =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        const fullPrompt = conversationContext
            ? `${conversationContext}\nUser: ${message}\nAssistant:`
            : message;

        // Generate response
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const aiResponse = response.text();

        // Save to history (limit to last 20 messages)
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: aiResponse });
        if (history.length > 40) {
            history.splice(0, 2); // Remove oldest pair
        }

        res.json({
            success: true,
            response: aiResponse,
            conversationId: conversationId || 'default'
        });

    } catch (error) {
        console.error('Error calling Gemini API:', error);

        // Handle specific error types
        if (error.message?.includes('API_KEY')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key. Please check your GEMINI_API_KEY.'
            });
        }

        if (error.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                error: 'API quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get AI response. Please try again.'
        });
    }
});

// Clear conversation history
app.delete('/api/chat/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    conversationHistory.delete(conversationId);
    res.json({ success: true, message: 'Conversation history cleared' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 ChatAI Backend running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
});
