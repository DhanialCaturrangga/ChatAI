import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    AppState,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import supabase from '../../lib/supabase';

interface ChatMessage {
    id: string;
    room_id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles?: { username: string; full_name: string };
}

interface TypingUser {
    userId: string;
    username: string;
}

interface OnlineUser {
    userId: string;
    username: string;
    onlineAt: string;
}

export default function ChatDetailScreen() {
    const colors = useColors();
    const { id: roomId } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation();
    const { user, profile } = useAuth();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [roomName, setRoomName] = useState('Chat');
    const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [loading, setLoading] = useState(true);

    const channelRef = useRef<any>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch room info
    useEffect(() => {
        if (!roomId) return;
        supabase
            .from('rooms')
            .select('name')
            .eq('id', roomId)
            .single()
            .then(({ data }) => {
                if (data?.name) {
                    setRoomName(data.name);
                }
            });
    }, [roomId]);

    // Set header
    useEffect(() => {
        const onlineCount = onlineUsers.length;
        navigation.setOptions({
            title: roomName,
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: colors.tabBarBackground },
            headerTintColor: colors.tint,
            headerTitleStyle: {
                color: colors.text,
                fontWeight: '600',
                fontSize: 17,
                letterSpacing: -0.4,
            },
            headerShadowVisible: false,
            headerRight: () => (
                <View style={styles.headerRight}>
                    {onlineCount > 0 && (
                        <View style={styles.onlineBadge}>
                            <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.onlineText, { color: colors.textSecondary }]}>
                                {onlineCount}
                            </Text>
                        </View>
                    )}
                </View>
            ),
        });
    }, [navigation, roomName, colors, onlineUsers]);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!roomId) return;
        try {
            const { data } = await supabase
                .from('messages')
                .select('*, profiles:user_id(username, full_name)')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Re-fetch on foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') fetchMessages();
        });
        return () => subscription.remove();
    }, [fetchMessages]);

    // Real-time: Live messages + Typing + Presence
    useEffect(() => {
        if (!roomId || !user) return;

        const channel = supabase.channel(`room:${roomId}`, {
            config: { presence: { key: user.id } },
        });

        // A. Live Messages (Postgres Changes)
        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${roomId}`,
            },
            async (payload: any) => {
                // Fetch profile for the new message
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('username, full_name')
                    .eq('id', payload.new.user_id)
                    .single();

                const newMsg: ChatMessage = {
                    ...payload.new,
                    profiles: profileData || undefined,
                };
                setMessages(prev => [...prev, newMsg]);
            }
        );

        // B. Typing Indicator (Broadcast)
        channel.on('broadcast', { event: 'typing' }, (payload: any) => {
            const { userId, username, isTyping } = payload.payload;
            if (userId === user.id) return; // Ignore own typing

            setTypingUsers(prev => {
                if (isTyping) {
                    if (prev.find(u => u.userId === userId)) return prev;
                    return [...prev, { userId, username }];
                } else {
                    return prev.filter(u => u.userId !== userId);
                }
            });
        });

        // C. Online Status (Presence)
        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const users: OnlineUser[] = [];
            Object.values(state).forEach((presences: any) => {
                presences.forEach((p: any) => {
                    users.push({
                        userId: p.userId,
                        username: p.username,
                        onlineAt: p.onlineAt,
                    });
                });
            });
            setOnlineUsers(users);
        });

        channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                // Track presence
                await channel.track({
                    userId: user.id,
                    username: profile?.username || user.email?.split('@')[0] || 'User',
                    onlineAt: new Date().toISOString(),
                });
            }
        });

        channelRef.current = channel;

        // IMPORTANT: Proper cleanup with removeChannel
        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [roomId, user, profile]);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    useEffect(() => {
        if (messages.length > 0) scrollToBottom();
    }, [messages.length, scrollToBottom]);

    // Send typing indicator
    const sendTypingIndicator = (isTyping: boolean) => {
        channelRef.current?.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
                userId: user?.id,
                username: profile?.username || user?.email?.split('@')[0] || 'User',
                isTyping,
            },
        });
    };

    const handleTextChange = (text: string) => {
        setInputText(text);

        // Send typing start
        sendTypingIndicator(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Send typing stop after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingIndicator(false);
        }, 2000);
    };

    // Send message
    const sendMessage = async () => {
        if (!inputText.trim() || !user || !roomId) return;

        const messageText = inputText.trim();
        setInputText('');
        sendTypingIndicator(false);

        try {
            const { error } = await supabase.from('messages').insert({
                room_id: roomId,
                user_id: user.id,
                content: messageText,
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            setInputText(messageText); // Restore input on error
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isOwnMessage = item.user_id === user?.id;
        const senderName = item.profiles?.username || item.profiles?.full_name || 'User';

        return (
            <View style={[
                styles.messageBubbleContainer,
                isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}>
                {!isOwnMessage && (
                    <Text style={[styles.senderName, { color: colors.tint }]}>
                        {senderName}
                    </Text>
                )}
                <View style={[
                    styles.bubble,
                    {
                        backgroundColor: isOwnMessage ? colors.userBubble : colors.aiBubble,
                    },
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isOwnMessage ? colors.userBubbleText : colors.aiBubbleText },
                    ]}>
                        {item.content}
                    </Text>
                </View>
                <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                    {formatTime(item.created_at)}
                </Text>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;
        const names = typingUsers.map(u => u.username).join(', ');
        return (
            <View style={styles.typingContainer}>
                <View style={[styles.typingBubble, { backgroundColor: colors.aiBubble }]}>
                    <View style={styles.typingDots}>
                        <View style={[styles.dot, styles.dot1, { backgroundColor: colors.textTertiary }]} />
                        <View style={[styles.dot, styles.dot2, { backgroundColor: colors.textTertiary }]} />
                        <View style={[styles.dot, styles.dot3, { backgroundColor: colors.textTertiary }]} />
                    </View>
                </View>
                <Text style={[styles.typingText, { color: colors.textTertiary }]}>
                    {names} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </Text>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                <Text style={styles.emptyEmoji}>💬</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{roomName}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Send a message to start the conversation!
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
                ListEmptyComponent={!loading ? renderEmpty : null}
                ListFooterComponent={renderTypingIndicator}
                onContentSizeChange={scrollToBottom}
                showsVerticalScrollIndicator={false}
            />

            {/* Online users strip */}
            {onlineUsers.length > 0 && (
                <View style={[styles.onlineStrip, { backgroundColor: colors.cardSolid, borderTopColor: colors.separator }]}>
                    <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.onlineStripText, { color: colors.textSecondary }]}>
                        {onlineUsers.length} online: {onlineUsers.map(u => u.username).join(', ')}
                    </Text>
                </View>
            )}

            {/* Input bar */}
            <View style={[
                styles.inputContainer,
                {
                    backgroundColor: colors.tabBarBackground,
                    borderTopColor: colors.separator,
                }
            ]}>
                <View style={[
                    styles.inputWrapper,
                    {
                        backgroundColor: colors.cardSolid,
                        borderColor: colors.inputBorder,
                    }
                ]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Message"
                        placeholderTextColor={colors.inputPlaceholder}
                        value={inputText}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={2000}
                    />
                </View>

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
    container: { flex: 1 },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        gap: 8,
    },
    onlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onlineDot: {
        width: 8, height: 8, borderRadius: 4,
    },
    onlineText: { fontSize: 13, fontWeight: '500' },
    messageList: { paddingVertical: 16, paddingHorizontal: 12 },
    emptyList: { flex: 1, justifyContent: 'center' },
    emptyContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyEmoji: { fontSize: 40 },
    emptyTitle: {
        fontSize: 20, fontWeight: '600', marginBottom: 8, letterSpacing: -0.4,
    },
    emptySubtitle: {
        fontSize: 15, textAlign: 'center', lineHeight: 20, letterSpacing: -0.2,
    },
    messageBubbleContainer: {
        marginBottom: 8,
        maxWidth: '80%',
    },
    ownMessage: { alignSelf: 'flex-end', alignItems: 'flex-end' },
    otherMessage: { alignSelf: 'flex-start', alignItems: 'flex-start' },
    senderName: {
        fontSize: 12, fontWeight: '600',
        marginBottom: 2, marginLeft: 12, letterSpacing: -0.2,
    },
    bubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    messageText: {
        fontSize: 16, lineHeight: 22, letterSpacing: -0.3,
    },
    timestamp: {
        fontSize: 11, marginTop: 4, marginHorizontal: 8,
    },
    // Typing indicator
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        gap: 8,
    },
    typingBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    typingDots: {
        flexDirection: 'row',
        gap: 4,
    },
    dot: {
        width: 7, height: 7, borderRadius: 3.5,
    },
    dot1: { opacity: 0.4 },
    dot2: { opacity: 0.6 },
    dot3: { opacity: 0.8 },
    typingText: { fontSize: 12, fontStyle: 'italic' },
    // Online strip
    onlineStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 6,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    onlineStripText: { fontSize: 12 },
    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        paddingBottom: Platform.OS === 'ios' ? 34 : 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 6,
    },
    iconButton: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
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
        fontSize: 17, lineHeight: 22,
        letterSpacing: -0.4, maxHeight: 84,
    },
    sendButton: {
        width: 36, height: 36,
        justifyContent: 'center', alignItems: 'center',
    },
});
