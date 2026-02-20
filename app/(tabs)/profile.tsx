import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ProfileMenuItem from '../../components/ProfileMenuItem';
import { useAuth } from '../../context/AuthContext';
import { useColors, useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
    const colors = useColors();
    const { colorScheme, toggleTheme } = useTheme();
    const { user, profile, signOut } = useAuth();

    const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
    const displayEmail = user?.email || '';

    const handleLogout = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
    };

    const handleMenuPress = (menuItem: string) => {
        Alert.alert(menuItem, `You tapped on ${menuItem}`);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
        >
            {/* iOS Large Title Header */}
            <View style={styles.headerSection}>
                <Text style={[styles.largeTitle, { color: colors.text }]}>Settings</Text>
            </View>

            {/* Profile Card */}
            <TouchableOpacity
                style={[styles.profileCard, { backgroundColor: colors.cardSolid }]}
                activeOpacity={0.6}
                onPress={() => handleMenuPress('Profile')}
            >
                <View style={[styles.avatarLarge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.avatarInitials}>
                        {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>
                        {displayEmail}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Settings */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <ProfileMenuItem
                    icon="moon"
                    iconBackgroundColor="#1C1C1E"
                    label="Dark Mode"
                    showArrow={false}
                    rightComponent={
                        <Switch
                            value={colorScheme === 'dark'}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.inputBackground, true: colors.success }}
                            thumbColor="#FFFFFF"
                            style={styles.switch}
                        />
                    }
                />
                <ProfileMenuItem
                    icon="notifications"
                    iconBackgroundColor="#FF3B30"
                    label="Notifications"
                    onPress={() => handleMenuPress('Notifications')}
                />
                <ProfileMenuItem
                    icon="newspaper"
                    iconBackgroundColor="#007AFF"
                    label="Daily Digest"
                    value="Berita AI"
                    onPress={() => router.push('/digest-settings' as any)}
                />
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <ProfileMenuItem
                    icon="hand-left"
                    iconBackgroundColor="#007AFF"
                    label="Privacy & Security"
                    onPress={() => handleMenuPress('Privacy & Security')}
                />
                <ProfileMenuItem
                    icon="information-circle"
                    iconBackgroundColor="#8E8E93"
                    label="About"
                    onPress={() => handleMenuPress('About')}
                />
            </View>

            {/* Sign Out */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid, marginBottom: 40 }]}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.6}
                >
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 100 },
    headerSection: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    largeTitle: {
        fontSize: 34, fontWeight: '700', letterSpacing: 0.4,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 12,
        borderRadius: 12,
    },
    avatarLarge: {
        width: 60, height: 60, borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 24, fontWeight: '600', color: '#FFFFFF',
    },
    profileInfo: { flex: 1, marginLeft: 12 },
    profileName: {
        fontSize: 20, fontWeight: '600', letterSpacing: -0.4,
    },
    profileSubtitle: {
        fontSize: 13, marginTop: 2, letterSpacing: -0.2,
    },
    section: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    switch: {
        transform: Platform.OS === 'ios' ? [] : [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    logoutText: {
        fontSize: 17, fontWeight: '500', letterSpacing: -0.3,
    },
});
