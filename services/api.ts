// API Service for ChatAI
import { API_ENDPOINTS } from '../config/config';

export interface ChatResponse {
    success: boolean;
    response?: string;
    error?: string;
    conversationId?: string;
}

/**
 * Send a message to the AI backend and get a response
 * @param message - The user's message
 * @param conversationId - Optional conversation ID for context
 * @returns ChatResponse with AI response or error
 */
export async function sendMessageToAI(
    message: string,
    conversationId?: string
): Promise<ChatResponse> {
    try {
        const response = await fetch(API_ENDPOINTS.chat, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversationId: conversationId || 'default',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to get response from AI',
            };
        }

        return {
            success: true,
            response: data.response,
            conversationId: data.conversationId,
        };
    } catch (error) {
        console.error('API Error:', error);

        // Check if it's a network error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return {
                success: false,
                error: 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.',
            };
        }

        return {
            success: false,
            error: 'Terjadi kesalahan. Silakan coba lagi.',
        };
    }
}

/**
 * Check if the backend is healthy/running
 * @returns boolean indicating if backend is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(API_ENDPOINTS.health, {
            method: 'GET',
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Clear conversation history on the backend
 * @param conversationId - The conversation ID to clear
 */
export async function clearConversationHistory(
    conversationId: string
): Promise<void> {
    try {
        await fetch(`${API_ENDPOINTS.chat}/${conversationId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error clearing conversation:', error);
    }
}
