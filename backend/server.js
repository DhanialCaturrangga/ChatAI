require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// Import digest services
const digestStore = require('./data/digestStore');
const { testGroundingConnection } = require('./services/geminiGrounding');
const { isValidPushToken } = require('./services/pushNotification');
const { startScheduler, testDigestGeneration, triggerManualDigest } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI with NEW @google/genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Store conversation history (in production, use a database)
const conversationHistory = new Map();

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Kamu adalah AI assistant yang ramah dan helpful. Kamu adalah bagian dari aplikasi ChatAI mobile. 
Jawab dengan bahasa yang sama dengan user (jika user berbahasa Indonesia, jawab dalam Bahasa Indonesia).
Berikan jawaban yang informatif, singkat, dan mudah dipahami.
Gunakan emoji secara natural untuk membuat percakapan lebih hidup.`;

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ChatAI Backend is running! 🚀' });
});

// ==================== CHAT ENDPOINTS ====================

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

        // Build conversation context
        const conversationContext = history.map(msg =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        const fullPrompt = conversationContext
            ? `${conversationContext}\nUser: ${message}\nAssistant:`
            : message;

        // Generate response using @google/genai SDK
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: SYSTEM_PROMPT
            }
        });

        const aiResponse = result.text || '';

        // Save to history (limit to last 20 messages)
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: aiResponse });
        if (history.length > 40) {
            history.splice(0, 2);
        }

        res.json({
            success: true,
            response: aiResponse,
            conversationId: conversationId || 'default'
        });

    } catch (error) {
        console.error('Error calling Gemini API:', error);

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

app.delete('/api/chat/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    conversationHistory.delete(conversationId);
    res.json({ success: true, message: 'Conversation history cleared' });
});

// ==================== DIGEST SETTINGS ENDPOINTS ====================

// Get available topics
app.get('/api/digest/topics', (req, res) => {
    const topics = digestStore.getAvailableTopics();
    res.json({ success: true, topics });
});

// Save digest settings
app.post('/api/digest/settings', (req, res) => {
    try {
        const { userId, digestTime, topics, customPrompt, enabled, timezone } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId is required'
            });
        }

        // Convert local time to UTC if timezone provided
        let digestTimeUTC = digestTime;
        if (digestTime && timezone) {
            // Simple timezone offset handling
            // Frontend should ideally send UTC time directly
            digestTimeUTC = digestTime; // Store as-is for now
        }

        const settings = digestStore.saveUserSettings(userId, {
            digestTime: digestTimeUTC,
            topics: topics || ['technology'],
            customPrompt: customPrompt || '',
            enabled: enabled !== undefined ? enabled : true,
            timezone: timezone || 'Asia/Jakarta'
        });

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error saving digest settings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save settings'
        });
    }
});

// Get digest settings
app.get('/api/digest/settings/:userId', (req, res) => {
    const { userId } = req.params;
    const settings = digestStore.getUserSettings(userId);

    if (!settings) {
        return res.json({
            success: true,
            settings: null,
            message: 'No settings found for this user'
        });
    }

    res.json({ success: true, settings });
});

// ==================== PUSH TOKEN ENDPOINTS ====================

// Register push token
app.post('/api/push/register', (req, res) => {
    try {
        const { userId, pushToken } = req.body;

        if (!userId || !pushToken) {
            return res.status(400).json({
                success: false,
                error: 'userId and pushToken are required'
            });
        }

        // Validate token format
        if (!isValidPushToken(pushToken)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Expo push token format'
            });
        }

        const settings = digestStore.savePushToken(userId, pushToken);
        console.log(`📱 Push token registered for user: ${userId}`);

        res.json({ success: true, message: 'Push token registered successfully' });
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to register push token'
        });
    }
});

// ==================== DIGEST HISTORY ENDPOINTS ====================

// Get digest history
app.get('/api/digest/history/:userId', (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const digests = digestStore.getUserDigestHistory(userId, limit);
    res.json({ success: true, digests });
});

// Get single digest
app.get('/api/digest/:digestId', (req, res) => {
    const { digestId } = req.params;
    const digest = digestStore.getDigestById(digestId);

    if (!digest) {
        return res.status(404).json({
            success: false,
            error: 'Digest not found'
        });
    }

    // Mark as read
    digestStore.markDigestAsRead(digestId);

    res.json({ success: true, digest });
});

// Delete digest
app.delete('/api/digest/:digestId', (req, res) => {
    const { digestId } = req.params;
    const deleted = digestStore.deleteDigest(digestId);

    if (!deleted) {
        return res.status(404).json({
            success: false,
            error: 'Digest not found'
        });
    }

    res.json({ success: true, message: 'Digest deleted' });
});

// ==================== TEST ENDPOINTS ====================

// Test Gemini Grounding connection
app.get('/api/test-grounding', async (req, res) => {
    console.log('🧪 Testing Gemini Grounding connection...');
    const result = await testGroundingConnection();
    res.json(result);
});

// Test digest generation (without sending notification)
app.post('/api/test-digest', async (req, res) => {
    try {
        const { topic, topics, customPrompt, userId, sendNotification } = req.body;

        // If sendNotification is true and userId provided, trigger full flow
        if (sendNotification && userId) {
            console.log(`🚀 Triggering manual digest for user: ${userId}`);
            const result = await triggerManualDigest(userId);
            return res.json(result);
        }

        // Otherwise, just test digest generation
        const topicsArray = topics || (topic ? [topic] : ['technology']);
        console.log(`🧪 Testing digest generation for topics: ${topicsArray.join(', ')}`);

        const result = await testDigestGeneration({
            topics: topicsArray,
            customPrompt: customPrompt || '',
            userId: userId || null
        });

        res.json(result);
    } catch (error) {
        console.error('Error in test-digest:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`\n🚀 ChatAI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`📰 Digest API: http://localhost:${PORT}/api/digest/settings`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test Grounding: http://localhost:${PORT}/api/test-grounding\n`);

    // Start the digest scheduler
    startScheduler();
});
