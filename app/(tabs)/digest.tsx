import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import DigestCard from '../../components/DigestCard';
import { useColors } from '../../context/ThemeContext';
import { Digest, getDigestHistory } from '../../services/digestApi';

// Default user ID (in production, get from auth)
const USER_ID = 'user-1';

export default function DigestHistoryScreen() {
    const colors = useColors();

    const [digests, setDigests] = useState<Digest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadDigests();
    }, []);

    const loadDigests = async () => {
        try {
            setLoading(true);
            const history = await getDigestHistory(USER_ID);
            setDigests(history);
        } catch (error) {
            console.error('Error loading digests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadDigests();
        setRefreshing(false);
    }, []);

    const handleDigestPress = (digest: Digest) => {
        router.push(`/digest/${digest.id}` as any);
    };

    const handleSettingsPress = () => {
        router.push('/digest-settings' as any);
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="newspaper-outline" size={48} color={colors.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Belum ada digest
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Atur Daily Digest untuk menerima ringkasan berita harian dari AI
            </Text>
            <TouchableOpacity
                style={[styles.setupButton, { backgroundColor: colors.tint }]}
                onPress={handleSettingsPress}
            >
                <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
                <Text style={styles.setupButtonText}>Atur Daily Digest</Text>
            </TouchableOpacity>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                RIWAYAT DIGEST
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.largeTitle, { color: colors.text }]}>Digest</Text>
                <TouchableOpacity
                    style={[styles.settingsButton, { backgroundColor: colors.inputBackground }]}
                    onPress={handleSettingsPress}
                >
                    <Ionicons name="settings-outline" size={22} color={colors.tint} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {digests.length === 0 ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={digests}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DigestCard
                            digest={item}
                            onPress={() => handleDigestPress(item)}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.tint}
                        />
                    }
                />
            )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    largeTitle: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.4,
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 100,
    },
    listHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    setupButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    setupButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
