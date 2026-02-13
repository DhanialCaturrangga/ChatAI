// Gemini Grounding Service
// Uses @google/genai with Google Search for real-time news

const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini AI with the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate news digest using Gemini with Google Grounding
 * @param {Object} options - Digest options
 * @param {string[]} options.topics - Array of topic IDs
 * @param {string} options.customPrompt - Custom user prompt
 * @param {string} options.language - Language for the digest (default: 'id')
 * @returns {Promise<Object>} Digest content with sources
 */
async function generateNewsDigest(options = {}) {
    const {
        topics = ['technology'],
        customPrompt = '',
        language = 'id'
    } = options;

    // Build the prompt
    const topicLabels = topics.map(t => {
        const topicMap = {
            'technology': 'Teknologi',
            'business': 'Bisnis',
            'sports': 'Olahraga',
            'entertainment': 'Hiburan',
            'science': 'Sains',
            'politics': 'Politik',
            'health': 'Kesehatan',
            'world': 'Berita Dunia'
        };
        return topicMap[t] || t;
    }).join(', ');

    const languageInstruction = language === 'id'
        ? 'Tulis dalam Bahasa Indonesia yang baik dan benar.'
        : 'Write in English.';

    const basePrompt = `
Kamu adalah AI news curator yang bertugas membuat ringkasan berita harian.

TUGAS:
Cari dan rangkum berita terbaru hari ini tentang: ${topicLabels}

${customPrompt ? `INSTRUKSI KHUSUS DARI USER: ${customPrompt}` : ''}

FORMAT OUTPUT:
1. Mulai dengan greeting singkat dan tanggal hari ini
2. Untuk setiap topik, berikan 2-3 berita utama dengan:
   - Judul berita
   - Ringkasan singkat (2-3 kalimat)
   - Mengapa ini penting
3. Akhiri dengan insight atau kesimpulan singkat

PERATURAN:
- ${languageInstruction}
- Fokus pada berita dari 24 jam terakhir
- Pastikan informasi akurat dan dari sumber terpercaya
- Gunakan emoji untuk membuat lebih menarik
- Jaga agar ringkasan tetap informatif tapi mudah dibaca
- Total panjang sekitar 500-800 kata
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: basePrompt,
            config: {
                tools: [{ googleSearch: {} }] // Enable Google Grounding!
            }
        });

        // Extract the text content
        const text = response.text || '';

        // Extract grounding metadata if available
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = [];

        if (groundingMetadata?.groundingChunks) {
            for (const chunk of groundingMetadata.groundingChunks) {
                if (chunk.web) {
                    sources.push({
                        title: chunk.web.title || 'Unknown Source',
                        url: chunk.web.uri || ''
                    });
                }
            }
        }

        // Also check for search entry point if available
        const searchEntryPoint = groundingMetadata?.searchEntryPoint;

        return {
            success: true,
            content: text,
            sources: sources,
            searchEntryPoint: searchEntryPoint?.renderedContent || null,
            topics: topics,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error generating digest with Gemini Grounding:', error);

        // Provide more specific error messages
        if (error.message?.includes('API_KEY')) {
            throw new Error('Invalid Gemini API key. Please check GEMINI_API_KEY.');
        }
        if (error.message?.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        if (error.message?.includes('not found')) {
            throw new Error('Gemini model not available. Please check the model name.');
        }

        throw new Error(`Failed to generate digest: ${error.message}`);
    }
}

/**
 * Test the Gemini Grounding connection
 * @returns {Promise<Object>} Test result
 */
async function testGroundingConnection() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'What is the current date and a brief news headline from today?',
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return {
            success: true,
            message: 'Gemini Grounding is working!',
            sample: response.text?.substring(0, 200) + '...'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

module.exports = {
    generateNewsDigest,
    testGroundingConnection
};
