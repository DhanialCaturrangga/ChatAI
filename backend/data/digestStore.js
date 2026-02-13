// Digest Data Store
// In-memory storage for digest settings and history
// For production, replace with database (MongoDB, PostgreSQL, etc.)

const { v4: uuidv4 } = require('uuid');

// Storage
const userSettings = new Map(); // userId -> settings
const digestHistory = new Map(); // digestId -> digest
const userDigests = new Map();   // userId -> [digestId, ...]

// Default topics available
const AVAILABLE_TOPICS = [
    { id: 'technology', label: 'Teknologi', labelEn: 'Technology' },
    { id: 'business', label: 'Bisnis', labelEn: 'Business' },
    { id: 'sports', label: 'Olahraga', labelEn: 'Sports' },
    { id: 'entertainment', label: 'Hiburan', labelEn: 'Entertainment' },
    { id: 'science', label: 'Sains', labelEn: 'Science' },
    { id: 'politics', label: 'Politik', labelEn: 'Politics' },
    { id: 'health', label: 'Kesehatan', labelEn: 'Health' },
    { id: 'world', label: 'Dunia', labelEn: 'World' }
];

// Get available topics
function getAvailableTopics() {
    return AVAILABLE_TOPICS;
}

// Save user digest settings
function saveUserSettings(userId, settings) {
    const existingSettings = userSettings.get(userId) || {};
    const updatedSettings = {
        ...existingSettings,
        ...settings,
        userId,
        updatedAt: new Date().toISOString()
    };

    // Ensure digestTime is stored in UTC
    if (settings.digestTime) {
        updatedSettings.digestTimeUTC = settings.digestTime;
    }

    userSettings.set(userId, updatedSettings);
    return updatedSettings;
}

// Get user digest settings
function getUserSettings(userId) {
    return userSettings.get(userId) || null;
}

// Get all users with enabled digests
function getAllEnabledUsers() {
    const enabledUsers = [];
    for (const [userId, settings] of userSettings.entries()) {
        if (settings.enabled && settings.pushToken) {
            enabledUsers.push({ userId, ...settings });
        }
    }
    return enabledUsers;
}

// Save push token for user
function savePushToken(userId, pushToken) {
    const settings = userSettings.get(userId) || { userId };
    settings.pushToken = pushToken;
    settings.tokenUpdatedAt = new Date().toISOString();
    userSettings.set(userId, settings);
    return settings;
}

// Save a new digest to history
function saveDigest(userId, digestData) {
    const digestId = uuidv4();
    const digest = {
        id: digestId,
        userId,
        ...digestData,
        createdAt: new Date().toISOString(),
        read: false
    };

    digestHistory.set(digestId, digest);

    // Add to user's digest list
    const userDigestList = userDigests.get(userId) || [];
    userDigestList.unshift(digestId); // Add to beginning (newest first)
    userDigests.set(userId, userDigestList);

    return digest;
}

// Get digest by ID
function getDigestById(digestId) {
    return digestHistory.get(digestId) || null;
}

// Get user's digest history
function getUserDigestHistory(userId, limit = 50) {
    const digestIds = userDigests.get(userId) || [];
    const digests = [];

    for (const digestId of digestIds.slice(0, limit)) {
        const digest = digestHistory.get(digestId);
        if (digest) {
            digests.push(digest);
        }
    }

    return digests;
}

// Mark digest as read
function markDigestAsRead(digestId) {
    const digest = digestHistory.get(digestId);
    if (digest) {
        digest.read = true;
        digest.readAt = new Date().toISOString();
        digestHistory.set(digestId, digest);
        return digest;
    }
    return null;
}

// Delete digest
function deleteDigest(digestId) {
    const digest = digestHistory.get(digestId);
    if (digest) {
        digestHistory.delete(digestId);

        // Remove from user's list
        const userDigestList = userDigests.get(digest.userId) || [];
        const index = userDigestList.indexOf(digestId);
        if (index > -1) {
            userDigestList.splice(index, 1);
            userDigests.set(digest.userId, userDigestList);
        }
        return true;
    }
    return false;
}

module.exports = {
    getAvailableTopics,
    saveUserSettings,
    getUserSettings,
    getAllEnabledUsers,
    savePushToken,
    saveDigest,
    getDigestById,
    getUserDigestHistory,
    markDigestAsRead,
    deleteDigest
};
