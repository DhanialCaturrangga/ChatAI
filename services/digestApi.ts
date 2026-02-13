// Digest API Service
// API calls for digest settings, history, and testing

import { API_ENDPOINTS } from '../config/config';

// Types
export interface DigestTopic {
    id: string;
    label: string;
    labelEn: string;
}

export interface DigestSettings {
    userId: string;
    digestTime: string; // HH:MM format in UTC
    topics: string[];
    customPrompt: string;
    enabled: boolean;
    timezone: string;
    pushToken?: string;
    updatedAt?: string;
}

export interface Digest {
    id: string;
    userId: string;
    content: string;
    sources: { title: string; url: string }[];
    topics: string[];
    customPrompt: string;
    createdAt: string;
    read: boolean;
    readAt?: string;
}

/**
 * Get available digest topics
 */
export async function getDigestTopics(): Promise<DigestTopic[]> {
    try {
        const response = await fetch(API_ENDPOINTS.digestTopics);
        const data = await response.json();
        return data.success ? data.topics : [];
    } catch (error) {
        console.error('Error fetching topics:', error);
        return [];
    }
}

/**
 * Save digest settings
 */
export async function saveDigestSettings(settings: Partial<DigestSettings>): Promise<DigestSettings | null> {
    try {
        const response = await fetch(API_ENDPOINTS.digestSettings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        const data = await response.json();
        return data.success ? data.settings : null;
    } catch (error) {
        console.error('Error saving settings:', error);
        return null;
    }
}

/**
 * Get digest settings for a user
 */
export async function getDigestSettings(userId: string): Promise<DigestSettings | null> {
    try {
        const response = await fetch(`${API_ENDPOINTS.digestSettings}/${userId}`);
        const data = await response.json();
        return data.success ? data.settings : null;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
}

/**
 * Get digest history for a user
 */
export async function getDigestHistory(userId: string, limit = 50): Promise<Digest[]> {
    try {
        const response = await fetch(`${API_ENDPOINTS.digestHistory}/${userId}?limit=${limit}`);
        const data = await response.json();
        return data.success ? data.digests : [];
    } catch (error) {
        console.error('Error fetching history:', error);
        return [];
    }
}

/**
 * Get a single digest by ID
 */
export async function getDigestById(digestId: string): Promise<Digest | null> {
    try {
        const response = await fetch(`${API_ENDPOINTS.digest}/${digestId}`);
        const data = await response.json();
        return data.success ? data.digest : null;
    } catch (error) {
        console.error('Error fetching digest:', error);
        return null;
    }
}

/**
 * Delete a digest
 */
export async function deleteDigest(digestId: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_ENDPOINTS.digest}/${digestId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error deleting digest:', error);
        return false;
    }
}

/**
 * Test digest generation (for debugging)
 */
export async function testDigestGeneration(options: {
    topics?: string[];
    customPrompt?: string;
    userId?: string;
    sendNotification?: boolean;
}): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
        const response = await fetch(API_ENDPOINTS.testDigest, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
        });
        return await response.json();
    } catch (error) {
        console.error('Error testing digest:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * Convert local time to UTC time string
 */
export function localTimeToUTC(hours: number, minutes: number, timezoneOffset: number = new Date().getTimezoneOffset()): string {
    // timezoneOffset is in minutes, negative for UTC+ zones
    const totalMinutes = hours * 60 + minutes + timezoneOffset;
    const utcHours = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
    const utcMinutes = ((totalMinutes % 60) + 60) % 60;
    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
}

/**
 * Convert UTC time string to local time
 */
export function utcTimeToLocal(utcTime: string, timezoneOffset: number = new Date().getTimezoneOffset()): { hours: number; minutes: number } {
    const [utcHours, utcMinutes] = utcTime.split(':').map(Number);
    const totalMinutes = utcHours * 60 + utcMinutes - timezoneOffset;
    const localHours = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
    const localMinutes = ((totalMinutes % 60) + 60) % 60;
    return { hours: localHours, minutes: localMinutes };
}
