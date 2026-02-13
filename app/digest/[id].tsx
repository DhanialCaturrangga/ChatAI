import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useColors } from '../../context/ThemeContext';
import { Digest, getDigestById } from '../../services/digestApi';

export default function DigestDetailScreen() {
    const colors = useColors();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [digest, setDigest] = useState<Digest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadDigest(id);
        }
    }, [id]);

    const loadDigest = async (digestId: string) => {
        try {
            setLoading(true);
            const data = await getDigestById(digestId);
            setDigest(data);
        } catch (error) {
            console.error('Error loading digest:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!digest) return;

        try {
            const preview = digest.content.substring(0, 200).replace(/[#*_~`]/g, '');
            await Share.share({
                message: `📰 Daily Digest\n\n${preview}...\n\nDikirim dari ChatAI`,
                title: 'Daily Digest',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleSourcePress = (url: string) => {
        if (url) {
            Linking.openURL(url);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Simple markdown-like rendering
    const renderContent = (content: string) => {
        const lines = content.split('\n');
        return lines.map((line, index) => {
            const trimmed = line.trim();

            // Headers
            if (trimmed.startsWith('###')) {
                return (
                    <Text key={index} style={[styles.h3, { color: colors.text }]}>
                        {trimmed.replace(/^###\s*/, '')}
                    </Text>
                );
            }
            if (trimmed.startsWith('##')) {
                return (
                    <Text key={index} style={[styles.h2, { color: colors.text }]}>
                        {trimmed.replace(/^##\s*/, '')}
                    </Text>
                );
            }
            if (trimmed.startsWith('#')) {
                return (
                    <Text key={index} style={[styles.h1, { color: colors.text }]}>
                        {trimmed.replace(/^#\s*/, '')}
                    </Text>
                );
            }

            // Bold text (simple)
            if (trimmed.includes('**')) {
                const parts = trimmed.split(/\*\*(.*?)\*\*/g);
                return (
                    <Text key={index} style={[styles.paragraph, { color: colors.text }]}>
                        {parts.map((part, i) =>
                            i % 2 === 1 ? (
                                <Text key={i} style={styles.bold}>{part}</Text>
                            ) : part
                        )}
                    </Text>
                );
            }

            // Empty line
            if (!trimmed) {
                return <View key={index} style={styles.spacer} />;
            }

            // Normal paragraph
            return (
                <Text key={index} style={[styles.paragraph, { color: colors.text }]}>
                    {trimmed}
                </Text>
            );
        });
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    if (!digest) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.errorText, { color: colors.text }]}>
                    Digest tidak ditemukan
                </Text>
                <TouchableOpacity
                    style={[styles.backLink, { borderColor: colors.tint }]}
                    onPress={() => router.back()}
                >
                    <Text style={[styles.backLinkText, { color: colors.tint }]}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.tint} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                    Daily Digest
                </Text>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleShare}
                >
                    <Ionicons name="share-outline" size={22} color={colors.tint} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Meta info */}
                <View style={styles.metaSection}>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {formatDate(digest.createdAt)}
                    </Text>

                    {/* Topics */}
                    <View style={styles.topicsRow}>
                        {digest.topics.map((topic) => (
                            <View
                                key={topic}
                                style={[styles.topicBadge, { backgroundColor: colors.tint + '15' }]}
                            >
                                <Text style={[styles.topicText, { color: colors.tint }]}>
                                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentSection}>
                    {renderContent(digest.content)}
                </View>

                {/* Sources */}
                {digest.sources && digest.sources.length > 0 && (
                    <View style={styles.sourcesSection}>
                        <Text style={[styles.sourcesTitle, { color: colors.textSecondary }]}>
                            SUMBER BERITA
                        </Text>
                        {digest.sources.map((source, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.sourceItem, { backgroundColor: colors.cardSolid }]}
                                onPress={() => handleSourcePress(source.url)}
                            >
                                <Ionicons name="link-outline" size={16} color={colors.tint} />
                                <Text
                                    style={[styles.sourceText, { color: colors.text }]}
                                    numberOfLines={2}
                                >
                                    {source.title || source.url}
                                </Text>
                                <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Custom prompt if any */}
                {digest.customPrompt && (
                    <View style={[styles.promptSection, { backgroundColor: colors.inputBackground }]}>
                        <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.promptText, { color: colors.textSecondary }]}>
                            Instruksi: "{digest.customPrompt}"
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 16,
        marginTop: 12,
        marginBottom: 20,
    },
    backLink: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    backLinkText: {
        fontSize: 15,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 8,
        paddingBottom: 12,
    },
    headerButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    metaSection: {
        marginBottom: 20,
    },
    date: {
        fontSize: 14,
        marginBottom: 12,
    },
    topicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    topicBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    topicText: {
        fontSize: 13,
        fontWeight: '500',
    },
    contentSection: {
        marginBottom: 24,
    },
    h1: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
        lineHeight: 32,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
        lineHeight: 28,
    },
    h3: {
        fontSize: 17,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
        lineHeight: 24,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 4,
    },
    bold: {
        fontWeight: '600',
    },
    spacer: {
        height: 12,
    },
    sourcesSection: {
        marginBottom: 20,
    },
    sourcesTitle: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    sourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        gap: 10,
    },
    sourceText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    promptSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    promptText: {
        flex: 1,
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 18,
    },
});
