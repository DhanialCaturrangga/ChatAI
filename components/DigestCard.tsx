import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useColors } from '../context/ThemeContext';
import type { Digest } from '../services/digestApi';

interface DigestCardProps {
    digest: Digest;
    onPress: () => void;
}

const TOPIC_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    technology: { icon: 'laptop-outline', color: '#007AFF' },
    business: { icon: 'briefcase-outline', color: '#34C759' },
    sports: { icon: 'football-outline', color: '#FF9500' },
    entertainment: { icon: 'film-outline', color: '#FF2D55' },
    science: { icon: 'flask-outline', color: '#5856D6' },
    politics: { icon: 'business-outline', color: '#8E8E93' },
    health: { icon: 'heart-outline', color: '#FF3B30' },
    world: { icon: 'globe-outline', color: '#00C7BE' },
};

export default function DigestCard({ digest, onPress }: DigestCardProps) {
    const colors = useColors();

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) {
            return 'Baru saja';
        } else if (diffHours < 24) {
            return `${diffHours} jam lalu`;
        } else if (diffDays === 1) {
            return 'Kemarin';
        } else if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: diffDays > 365 ? 'numeric' : undefined,
            });
        }
    };

    // Get preview text (first 120 chars)
    const getPreview = () => {
        const cleanContent = digest.content
            .replace(/[#*_~`]/g, '') // Remove markdown
            .replace(/\n+/g, ' ')     // Replace newlines
            .trim();
        return cleanContent.length > 120
            ? cleanContent.substring(0, 120) + '...'
            : cleanContent;
    };

    // Get primary topic
    const primaryTopic = digest.topics[0] || 'technology';
    const topicInfo = TOPIC_ICONS[primaryTopic] || TOPIC_ICONS.technology;

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.cardSolid },
                !digest.read && styles.unreadCard,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Unread indicator */}
            {!digest.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: topicInfo.color + '20' }]}>
                    <Ionicons name={topicInfo.icon} size={18} color={topicInfo.color} />
                </View>
                <View style={styles.headerText}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        📰 Daily Digest
                    </Text>
                    <Text style={[styles.date, { color: colors.textTertiary }]}>
                        {formatDate(digest.createdAt)}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>

            {/* Topics */}
            <View style={styles.topicsRow}>
                {digest.topics.slice(0, 3).map((topic) => {
                    const info = TOPIC_ICONS[topic] || TOPIC_ICONS.technology;
                    return (
                        <View
                            key={topic}
                            style={[styles.topicBadge, { backgroundColor: info.color + '15' }]}
                        >
                            <Text style={[styles.topicText, { color: info.color }]}>
                                {topic.charAt(0).toUpperCase() + topic.slice(1)}
                            </Text>
                        </View>
                    );
                })}
                {digest.topics.length > 3 && (
                    <Text style={[styles.moreTopics, { color: colors.textTertiary }]}>
                        +{digest.topics.length - 3}
                    </Text>
                )}
            </View>

            {/* Preview */}
            <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
                {getPreview()}
            </Text>

            {/* Sources count */}
            {digest.sources && digest.sources.length > 0 && (
                <View style={styles.sourcesRow}>
                    <Ionicons name="link-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.sourcesText, { color: colors.textTertiary }]}>
                        {digest.sources.length} sumber berita
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 16,
        borderRadius: 12,
        position: 'relative',
    },
    unreadCard: {
        borderLeftWidth: 3,
        borderLeftColor: '#007AFF',
    },
    unreadDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    topicsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    topicBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    topicText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreTopics: {
        fontSize: 12,
        alignSelf: 'center',
    },
    preview: {
        fontSize: 14,
        lineHeight: 20,
    },
    sourcesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 10,
    },
    sourcesText: {
        fontSize: 12,
    },
});
