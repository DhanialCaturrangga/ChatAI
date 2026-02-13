// Configuration for ChatAI app

// API Configuration
// For local development: 'http://localhost:3001'
// For production: Replace with your deployed backend URL (e.g., Railway, Render, Vercel)
export const API_BASE_URL = 'http://localhost:3001';

// For web/Expo Go, use your computer's IP address instead of localhost
// Example: 'http://192.168.1.100:3001'
// You can find your IP using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)

export const API_ENDPOINTS = {
    chat: `${API_BASE_URL}/api/chat`,
    health: `${API_BASE_URL}/api/health`,
    // Digest endpoints
    digestTopics: `${API_BASE_URL}/api/digest/topics`,
    digestSettings: `${API_BASE_URL}/api/digest/settings`,
    digestHistory: `${API_BASE_URL}/api/digest/history`,
    digest: `${API_BASE_URL}/api/digest`,
    // Push notification
    pushRegister: `${API_BASE_URL}/api/push/register`,
    // Testing
    testDigest: `${API_BASE_URL}/api/test-digest`,
    testGrounding: `${API_BASE_URL}/api/test-grounding`,
};
