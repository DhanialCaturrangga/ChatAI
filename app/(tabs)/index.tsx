import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ConversationItem from '../../components/ConversationItem';
import { useColors } from '../../context/ThemeContext';
import { Conversation, conversations } from '../../data/mockData';

export default function ConversationListScreen() {
  const colors = useColors();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [conversationList, setConversationList] = useState(conversations);
  const [searchText, setSearchText] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setConversationList([...conversations]);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/chat/${conversation.id}`);
  };

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const filteredConversations = searchText
    ? conversationList.filter(c =>
      c.title.toLowerCase().includes(searchText.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchText.toLowerCase())
    )
    : conversationList;

  const renderItem = ({ item, index }: { item: Conversation; index: number }) => (
    <View>
      <ConversationItem
        conversation={item}
        onPress={() => handleConversationPress(item)}
      />
      {/* iOS-style separator */}
      {index < filteredConversations.length - 1 && (
        <View style={[styles.separator, { backgroundColor: colors.separator, marginLeft: 84 }]} />
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      {/* iOS Large Title */}
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

      {/* iOS Search Bar */}
      <View style={[
        styles.searchContainer,
        { backgroundColor: colors.inputBackground }
      ]}>
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
        Messages you send and receive will appear here.
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredConversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={filteredConversations.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
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

      {/* Floating New Message Button - iOS style */}
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
  container: {
    flex: 1,
  },
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
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.4,
    paddingVertical: 0,
  },
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
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
  fabButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
      },
    }),
  },
});
