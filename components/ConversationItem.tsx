import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { Conversation, formatTimestamp } from '../data/mockData';

interface ConversationItemProps {
    conversation: Conversation;
    onPress: () => void;
}

export default function ConversationItem({ conversation, onPress }: ConversationItemProps) {
    const colors = useColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, { backgroundColor: 'transparent' }]}
            activeOpacity={0.6}
        >
            {/* iOS-style Avatar */}
            <View style={[styles.avatarContainer]}>
                <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                    <Text style={styles.avatarEmoji}>{conversation.avatar}</Text>
                </View>
                {/* Online indicator */}
                <View style={[styles.onlineIndicator, { backgroundColor: colors.success, borderColor: colors.cardSolid }]} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {conversation.title}
                    </Text>
                    <View style={styles.timeContainer}>
                        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                            {formatTimestamp(conversation.timestamp)}
                        </Text>
                        <Text style={[styles.chevron, { color: colors.textTertiary }]}>›</Text>
                    </View>
                </View>

                <Text
                    style={[styles.preview, { color: colors.textSecondary }]}
                    numberOfLines={2}
                >
                    {conversation.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        // iOS-style shadow
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
        }),
    },
    avatarEmoji: {
        fontSize: 28,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
        letterSpacing: -0.4,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timestamp: {
        fontSize: 15,
        fontWeight: '400',
    },
    chevron: {
        fontSize: 22,
        fontWeight: '300',
        marginLeft: 4,
    },
    preview: {
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.2,
    },
});
