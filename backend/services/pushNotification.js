// Push Notification Service
// Uses Expo Server SDK to send push notifications

const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send a push notification to a device
 * @param {string} pushToken - Expo push token
 * @param {Object} notification - Notification data
 * @param {string} notification.title - Notification title
 * @param {string} notification.body - Notification body
 * @param {Object} notification.data - Extra data for deep linking
 * @returns {Promise<Object>} Send result
 */
async function sendPushNotification(pushToken, notification) {
    const { title, body, data = {} } = notification;

    // Validate the push token
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return {
            success: false,
            error: 'Invalid Expo push token'
        };
    }

    // Create the message
    const message = {
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
        channelId: 'digest', // Android notification channel
    };

    try {
        // Send the notification
        const chunks = expo.chunkPushNotifications([message]);
        const tickets = [];

        for (const chunk of chunks) {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }

        // Check for errors in tickets
        const ticket = tickets[0];
        if (ticket.status === 'error') {
            console.error(`Error sending notification:`, ticket.message);
            if (ticket.details?.error) {
                console.error(`Error details:`, ticket.details.error);
            }
            return {
                success: false,
                error: ticket.message,
                details: ticket.details
            };
        }

        console.log(`✅ Push notification sent successfully to ${pushToken.substring(0, 20)}...`);
        return {
            success: true,
            ticketId: ticket.id
        };

    } catch (error) {
        console.error('Error sending push notification:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send digest notification to a user
 * @param {string} pushToken - User's push token
 * @param {Object} digest - Digest data
 * @returns {Promise<Object>} Send result
 */
async function sendDigestNotification(pushToken, digest) {
    const { id, topics = [], content = '' } = digest;

    // Create a preview of the content (first 100 chars)
    const preview = content.substring(0, 100).replace(/\n/g, ' ').trim() + '...';

    // Format topics for title
    const topicLabels = topics.map(t => {
        const labels = {
            'technology': '💻 Tech',
            'business': '💼 Bisnis',
            'sports': '⚽ Olahraga',
            'entertainment': '🎬 Hiburan',
            'science': '🔬 Sains',
            'politics': '🏛️ Politik',
            'health': '🏥 Kesehatan',
            'world': '🌍 Dunia'
        };
        return labels[t] || t;
    }).join(' • ');

    return sendPushNotification(pushToken, {
        title: `📰 Daily Digest: ${topicLabels || 'Berita Hari Ini'}`,
        body: preview,
        data: {
            type: 'digest',
            digestId: id,
            screen: 'digest-detail'
        }
    });
}

/**
 * Validate if a push token is valid Expo token
 * @param {string} token - Push token to validate
 * @returns {boolean} Is valid
 */
function isValidPushToken(token) {
    return Expo.isExpoPushToken(token);
}

module.exports = {
    sendPushNotification,
    sendDigestNotification,
    isValidPushToken
};
