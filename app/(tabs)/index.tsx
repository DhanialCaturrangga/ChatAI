import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useColors } from '../../context/ThemeContext';
import supabase from '../../lib/supabase';

interface Room {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  last_message_at?: string;
  member_count?: number;
  online_count?: number;
}

export default function ConversationListScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    try {
      // Get rooms the user belongs to with last message
      const { data: memberData } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (!memberData || memberData.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }

      const roomIds = memberData.map(m => m.room_id);
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .in('id', roomIds)
        .order('created_at', { ascending: false });

      if (roomsData) {
        // Fetch last message for each room
        const roomsWithMessages = await Promise.all(
          roomsData.map(async (room) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('content, created_at')
              .eq('room_id', room.id)
              .order('created_at', { ascending: false })
              .limit(1);

            return {
              ...room,
              last_message: messages?.[0]?.content,
              last_message_at: messages?.[0]?.created_at,
            };
          })
        );
        setRooms(roomsWithMessages);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Real-time: listen for new messages to update room list
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('room-list-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          // Refresh room list when any new message arrives
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchRooms]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  }, [fetchRooms]);

  const handleNewChat = async () => {
    Alert.prompt
      ? Alert.prompt('New Room', 'Enter room name:', async (name) => {
        if (!name?.trim()) return;
        await createRoom(name.trim());
      })
      : Alert.alert('New Room', 'Enter a name for the chat room', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'General Chat',
          onPress: () => createRoom('General Chat'),
        },
        {
          text: 'AI Discussion',
          onPress: () => createRoom('AI Discussion'),
        },
      ]);
  };

  const createRoom = async (name: string) => {
    if (!user) return;
    try {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({ name, type: 'group', created_by: user.id })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as member
      await supabase
        .from('room_members')
        .insert({ room_id: room.id, user_id: user.id });

      await fetchRooms();
      router.push(`/chat/${room.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create room');
    }
  };

  const filteredRooms = searchText
    ? rooms.filter(r =>
      r.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.last_message?.toLowerCase().includes(searchText.toLowerCase())
    )
    : rooms;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderItem = ({ item, index }: { item: Room; index: number }) => (
    <View>
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.6}
      >
        <View style={[styles.roomAvatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.roomAvatarText}>
            {item.type === 'group' ? '👥' : '💬'}
          </Text>
        </View>
        <View style={styles.roomInfo}>
          <View style={styles.roomHeader}>
            <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
              {item.name || 'Unnamed Room'}
            </Text>
            <Text style={[styles.roomTime, { color: colors.textTertiary }]}>
              {formatTime(item.last_message_at)}
            </Text>
          </View>
          <Text style={[styles.roomLastMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.last_message || 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
      {index < filteredRooms.length - 1 && (
        <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 84 }]} />
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.largeTitle, { color: colors.text }]}>Messages</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.6}>
            <Ionicons name="ellipsis-horizontal-circle" size={28} color={colors.tint} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNewChat}
            activeOpacity={0.6}
          >
            <Ionicons name="create-outline" size={26} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search"
          placeholderTextColor={colors.inputPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.6}>
            <View style={[styles.clearButton, { backgroundColor: colors.textTertiary }]}>
              <Ionicons name="close" size={12} color={colors.cardSolid} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name="chatbubbles" size={48} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Conversations</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Tap the + button to create a new chat room.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={filteredRooms.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      />
      <TouchableOpacity
        style={[styles.fabButton, { backgroundColor: colors.tint }]}
        onPress={handleNewChat}
        activeOpacity={0.8}
      >
        <Ionicons name="pencil" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerButtons: { flexDirection: 'row', gap: 16 },
  headerButton: { padding: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.4,
    paddingVertical: 0,
  },
  clearButton: {
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
  },
  list: { paddingBottom: 100 },
  emptyList: { flex: 1 },
  separator: { height: StyleSheet.hairlineWidth },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  roomAvatar: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  roomAvatarText: { fontSize: 24 },
  roomInfo: { flex: 1, marginLeft: 12 },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    flex: 1,
    marginRight: 8,
  },
  roomTime: { fontSize: 14, letterSpacing: -0.2 },
  roomLastMessage: {
    fontSize: 15,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22, fontWeight: '600',
    marginBottom: 8, letterSpacing: -0.4,
  },
  emptySubtitle: {
    fontSize: 15, textAlign: 'center',
    lineHeight: 20, letterSpacing: -0.2,
  },
  fabButton: {
    position: 'absolute',
    bottom: 100, right: 20,
    width: 56, height: 56,
    borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
});
