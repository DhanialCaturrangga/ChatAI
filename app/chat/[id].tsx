import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ChatBubble from '../../components/ChatBubble';
import TypingIndicator from '../../components/TypingIndicator';
import { useColors } from '../../context/ThemeContext';
import { conversations, Message } from '../../data/mockData';

const AI_RESPONSES = [
    "That's a great question! Let me think about that for a moment...",
    "I understand what you mean. Here's my perspective on that.",
    "Interesting! I'd love to help you explore that topic further.",
    "Thanks for sharing that. Here's what I think might work well for you.",
    "That's a fascinating topic! Let me share some insights.",
    "I appreciate your thoughtful question. Here's a detailed response.",
];

export default function ChatDetailScreen() {
    const colors = useColors();
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();
    const flatListRef = useRef<FlatList>(null);

    const conversation = conversations.find(c => c.id === id);
    const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messageAnimations = useRef<Map<string, Animated.Value>>(new Map());

    useEffect(() => {
        const title = conversation?.title || 'New Message';
        navigation.setOptions({
            title: title,
            headerBackTitle: 'Back',
            headerStyle: {
                backgroundColor: colors.tabBarBackground,
            },
            headerTintColor: colors.tint,
            headerTitleStyle: {
                color: colors.text,
                fontWeight: '600',
                fontSize: 17,
                letterSpacing: -0.4,
            },
            headerShadowVisible: false,
            headerRight: () => (
                <TouchableOpacity style={styles.headerRight} activeOpacity={0.6}>
                    <Ionicons name="videocam" size={26} color={colors.tint} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, conversation, colors]);

    const getAnimatedValue = (messageId: string): Animated.Value => {
        if (!messageAnimations.current.has(messageId)) {
            messageAnimations.current.set(messageId, new Animated.Value(1));
        }
        return messageAnimations.current.get(messageId)!;
    };

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const sendMessage = () => {
        if (!inputText.trim()) return;

        const newMessageId = `msg-${Date.now()}`;
        const newMessage: Message = {
            id: newMessageId,
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date(),
        };

        const animValue = new Animated.Value(0);
        messageAnimations.current.set(newMessageId, animValue);

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        scrollToBottom();

        Animated.spring(animValue, {
            toValue: 1,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();

        setIsTyping(true);

        setTimeout(() => {
            const aiMessageId = `msg-ai-${Date.now()}`;
            const aiResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];

            const aiMessage: Message = {
                id: aiMessageId,
                text: aiResponse,
                isUser: false,
                timestamp: new Date(),
            };

            const aiAnimValue = new Animated.Value(0);
            messageAnimations.current.set(aiMessageId, aiAnimValue);

            setIsTyping(false);
            setMessages(prev => [...prev, aiMessage]);
            scrollToBottom();

            Animated.spring(aiAnimValue, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }).start();
        }, 1200 + Math.random() * 800);
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isRecent = index >= messages.length - 2;
        const animatedValue = isRecent ? getAnimatedValue(item.id) : undefined;
        const isLastInGroup = index === messages.length - 1 ||
            (messages[index + 1]?.isUser !== item.isUser);

        return (
            <ChatBubble
                message={item}
                showTimestamp={isLastInGroup}
                animatedValue={animatedValue}
                isLastInGroup={isLastInGroup}
            />
        );
    };

    const renderEmptyChat = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                <Text style={styles.emptyEmoji}>🤖</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>AI Assistant</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Send a message to start the conversation. I'm here to help!
            </Text>
        </View>
    );

    const canSend = inputText.trim().length > 0;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.messageList,
                    messages.length === 0 && styles.emptyList,
                ]}
                ListEmptyComponent={renderEmptyChat}
                ListFooterComponent={<TypingIndicator isVisible={isTyping} />}
                onContentSizeChange={scrollToBottom}
                showsVerticalScrollIndicator={false}
            />

            {/* iOS Messages style input bar */}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.tabBarBackground,
                    borderTopColor: colors.separator,
                }
            ]}>
                {/* Plus button */}
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.6}>
                    <Ionicons name="add-circle" size={32} color={colors.tint} />
                </TouchableOpacity>

                {/* Input field */}
                <View style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: colors.cardSolid,
                        borderColor: colors.inputBorder,
                    }
                ]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="iMessage"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                    />
                </View>

                {/* Send button */}
                {canSend ? (
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-up-circle" size={34} color={colors.tint} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.iconButton} activeOpacity={0.6}>
                        <Ionicons name="mic" size={28} color={colors.tint} />
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerRight: {
        marginRight: 8,
        padding: 4,
    },
    messageList: {
        paddingVertical: 16,
    },
    emptyList: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyEmoji: {
        fontSize: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: -0.4,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 20,
        letterSpacing: -0.2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 6,
        // Glassmorphism for web
        ...(Platform.OS === 'web' && {
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
        }),
    },
    iconButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 8,
        minHeight: 36,
        maxHeight: 100,
    },
    input: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.4,
        maxHeight: 84,
    },
    sendButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
