import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { Message, formatMessageTime } from '../data/mockData';

interface ChatBubbleProps {
    message: Message;
    showTimestamp?: boolean;
    animatedValue?: Animated.Value;
    isLastInGroup?: boolean;
}

export default function ChatBubble({
    message,
    showTimestamp = true,
    animatedValue,
    isLastInGroup = true
}: ChatBubbleProps) {
    const colors = useColors();
    const isUser = message.isUser;

    // iOS Messages style bubble with tail
    const bubbleStyle = {
        backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
    };

    const textStyle = {
        color: isUser ? colors.userBubbleText : colors.aiBubbleText,
    };

    const containerStyle = animatedValue
        ? {
            opacity: animatedValue,
            transform: [
                {
                    translateY: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                },
                {
                    scale: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                    }),
                },
            ],
        }
        : {};

    return (
        <Animated.View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.aiContainer,
                containerStyle,
            ]}
        >
            <View style={styles.bubbleWrapper}>
                <View
                    style={[
                        styles.bubble,
                        bubbleStyle,
                        isUser ? styles.userBubble : styles.aiBubble,
                        isLastInGroup && (isUser ? styles.userBubbleTail : styles.aiBubbleTail),
                    ]}
                >
                    <Text style={[styles.messageText, textStyle]}>
                        {message.text}
                    </Text>
                </View>

                {showTimestamp && (
                    <Text
                        style={[
                            styles.timestamp,
                            { color: colors.textTertiary },
                            isUser ? styles.timestampRight : styles.timestampLeft
                        ]}
                    >
                        {formatMessageTime(message.timestamp)}
                    </Text>
                )}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 2,
        paddingHorizontal: 16,
    },
    userContainer: {
        alignItems: 'flex-end',
    },
    aiContainer: {
        alignItems: 'flex-start',
    },
    bubbleWrapper: {
        maxWidth: '78%',
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 18,
    },
    userBubble: {
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    aiBubble: {
        borderTopRightRadius: 18,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    // iOS-style bubble tail for last message in group
    userBubbleTail: {
        borderBottomRightRadius: 4,
    },
    aiBubbleTail: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.4,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        marginHorizontal: 6,
        fontWeight: '400',
    },
    timestampLeft: {
        textAlign: 'left',
    },
    timestampRight: {
        textAlign: 'right',
    },
});
