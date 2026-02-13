// Digest Scheduler Service
// Checks every minute which users need their daily digest

const schedule = require('node-schedule');
const digestStore = require('../data/digestStore');
const { generateNewsDigest } = require('./geminiGrounding');
const { sendDigestNotification } = require('./pushNotification');

let schedulerJob = null;
let isRunning = false;

/**
 * Start the digest scheduler
 * Runs every minute to check for users who need digests
 */
function startScheduler() {
    if (schedulerJob) {
        console.log('⚠️ Scheduler already running');
        return;
    }

    console.log('🕐 Starting Digest Scheduler...');

    // Run every minute
    schedulerJob = schedule.scheduleJob('* * * * *', async () => {
        if (isRunning) {
            console.log('⏳ Previous scheduler run still in progress, skipping...');
            return;
        }

        isRunning = true;
        try {
            await checkAndSendDigests();
        } catch (error) {
            console.error('❌ Scheduler error:', error);
        } finally {
            isRunning = false;
        }
    });

    console.log('✅ Digest Scheduler started - checking every minute');
}

/**
 * Stop the scheduler
 */
function stopScheduler() {
    if (schedulerJob) {
        schedulerJob.cancel();
        schedulerJob = null;
        console.log('🛑 Digest Scheduler stopped');
    }
}

/**
 * Check which users need digests and send them
 */
async function checkAndSendDigests() {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    console.log(`⏰ Checking digests at ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} UTC`);

    // Get all users with enabled digests
    const enabledUsers = digestStore.getAllEnabledUsers();

    if (enabledUsers.length === 0) {
        return;
    }

    console.log(`📋 Found ${enabledUsers.length} users with enabled digests`);

    for (const user of enabledUsers) {
        try {
            // Parse user's digest time (stored as HH:MM in UTC)
            const [userHour, userMinute] = (user.digestTimeUTC || '08:00').split(':').map(Number);

            // Check if it's time for this user's digest
            if (currentHour === userHour && currentMinute === userMinute) {
                console.log(`📬 Time to send digest for user: ${user.userId}`);
                await sendUserDigest(user);
            }
        } catch (error) {
            console.error(`❌ Error processing digest for user ${user.userId}:`, error);
        }
    }
}

/**
 * Send digest to a specific user
 * @param {Object} user - User settings object
 */
async function sendUserDigest(user) {
    const { userId, topics = ['technology'], customPrompt = '', pushToken } = user;

    if (!pushToken) {
        console.log(`⚠️ User ${userId} has no push token, skipping`);
        return;
    }

    console.log(`🤖 Generating digest for user ${userId}...`);

    try {
        // Generate the digest using Gemini Grounding
        const digestResult = await generateNewsDigest({
            topics,
            customPrompt,
            language: 'id'
        });

        if (!digestResult.success) {
            throw new Error('Failed to generate digest content');
        }

        // Save to history
        const savedDigest = digestStore.saveDigest(userId, {
            content: digestResult.content,
            sources: digestResult.sources,
            topics: topics,
            customPrompt: customPrompt,
            searchEntryPoint: digestResult.searchEntryPoint
        });

        console.log(`💾 Digest saved with ID: ${savedDigest.id}`);

        // Send push notification
        const notificationResult = await sendDigestNotification(pushToken, savedDigest);

        if (notificationResult.success) {
            console.log(`✅ Digest sent successfully to user ${userId}`);
        } else {
            console.error(`❌ Failed to send notification to user ${userId}:`, notificationResult.error);
        }

        return savedDigest;

    } catch (error) {
        console.error(`❌ Error sending digest to user ${userId}:`, error);
        throw error;
    }
}

/**
 * Manually trigger digest for a user (for testing)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
async function triggerManualDigest(userId) {
    const settings = digestStore.getUserSettings(userId);

    if (!settings) {
        return {
            success: false,
            error: 'User settings not found. Please save settings first.'
        };
    }

    try {
        const digest = await sendUserDigest(settings);
        return {
            success: true,
            digest
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Test digest generation without sending notification
 * @param {Object} options - Digest options
 * @returns {Promise<Object>} Generated digest
 */
async function testDigestGeneration(options = {}) {
    const { topics = ['technology'], customPrompt = '', userId } = options;

    try {
        const result = await generateNewsDigest({
            topics,
            customPrompt,
            language: 'id'
        });

        // Save to history if userId is provided
        if (result.success && userId) {
            const savedDigest = digestStore.saveDigest(userId, {
                content: result.content,
                sources: result.sources || [],
                topics: topics,
                customPrompt: customPrompt,
                searchEntryPoint: result.searchEntryPoint
            });
            console.log(`💾 Test digest saved to history with ID: ${savedDigest.id}`);
            result.digestId = savedDigest.id;
        }

        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    startScheduler,
    stopScheduler,
    checkAndSendDigests,
    triggerManualDigest,
    testDigestGeneration
};
