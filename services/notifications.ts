// Notifications Service
// Handle push notifications with Expo

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_ENDPOINTS } from '../config/config';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Store the notification listener cleanup functions
let notificationListener: Notifications.EventSubscription | null = null;
let responseListener: Notifications.EventSubscription | null = null;

/**
 * Request notification permissions
 * @returns Permission status
 */
export async function requestNotificationPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('digest', {
            name: 'Daily Digest',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#007AFF',
            sound: 'default',
        });
    }

    return true;
}

/**
 * Get the Expo push token
 * @returns Push token or null
 */
export async function getPushToken(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push token requires physical device');
        return null;
    }

    try {
        const token = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Will be auto-filled from app.json
        });
        return token.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Register push token with backend
 * @param userId User identifier
 * @param pushToken Expo push token
 */
export async function registerPushToken(userId: string, pushToken: string): Promise<boolean> {
    try {
        const response = await fetch(API_ENDPOINTS.pushRegister, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, pushToken }),
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Error registering push token:', error);
        return false;
    }
}

/**
 * Initialize push notifications
 * @param userId User identifier
 * @param onNotificationReceived Callback when notification received
 * @param onNotificationResponse Callback when user taps notification
 */
export async function initializePushNotifications(
    userId: string,
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): Promise<string | null> {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        return null;
    }

    // Get push token
    const pushToken = await getPushToken();
    if (!pushToken) {
        return null;
    }

    // Register with backend
    await registerPushToken(userId, pushToken);

    // Set up listeners
    if (notificationListener) {
        notificationListener.remove();
    }
    if (responseListener) {
        responseListener.remove();
    }

    notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
        onNotificationReceived?.(notification);
    });

    responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
        onNotificationResponse?.(response);
    });

    console.log('Push notifications initialized with token:', pushToken.substring(0, 20) + '...');
    return pushToken;
}

/**
 * Clean up notification listeners
 */
export function cleanupNotificationListeners(): void {
    if (notificationListener) {
        notificationListener.remove();
        notificationListener = null;
    }
    if (responseListener) {
        responseListener.remove();
        responseListener = null;
    }
}

/**
 * Get the notification data for deep linking
 * @param response Notification response
 * @returns Notification data object
 */
export function getNotificationData(response: Notifications.NotificationResponse): {
    type?: string;
    digestId?: string;
    screen?: string;
} {
    const data = response.notification.request.content.data || {};
    return {
        type: data.type as string | undefined,
        digestId: data.digestId as string | undefined,
        screen: data.screen as string | undefined,
    };
}
