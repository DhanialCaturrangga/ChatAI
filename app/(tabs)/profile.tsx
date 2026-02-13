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
import { useColors, useTheme } from '../../context/ThemeContext';
import { userProfile } from '../../data/mockData';

export default function ProfileScreen() {
    const colors = useColors();
    const { colorScheme, toggleTheme } = useTheme();

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

            {/* Profile Card - iOS Style */}
            <TouchableOpacity
                style={[styles.profileCard, { backgroundColor: colors.cardSolid }]}
                activeOpacity={0.6}
                onPress={() => handleMenuPress('Apple ID')}
            >
                <View style={[styles.avatarLarge, { backgroundColor: colors.tint }]}>
                    <Text style={styles.avatarInitials}>
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: colors.text }]}>{userProfile.name}</Text>
                    <Text style={[styles.profileSubtitle, { color: colors.textSecondary }]}>
                        Apple ID, iCloud & more
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Search Bar Suggestion */}
            <View style={[styles.searchSuggestion, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="search" size={18} color={colors.textTertiary} />
                <Text style={[styles.searchText, { color: colors.textTertiary }]}>Search</Text>
            </View>

            {/* Settings Sections */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <ProfileMenuItem
                    icon="airplane"
                    iconBackgroundColor="#FF9500"
                    label="Airplane Mode"
                    showArrow={false}
                    rightComponent={
                        <Switch
                            value={false}
                            trackColor={{ false: colors.inputBackground, true: colors.success }}
                            thumbColor="#FFFFFF"
                            style={styles.switch}
                        />
                    }
                />
                <ProfileMenuItem
                    icon="wifi"
                    iconBackgroundColor="#007AFF"
                    label="Wi-Fi"
                    value="Home"
                    onPress={() => handleMenuPress('Wi-Fi')}
                />
                <ProfileMenuItem
                    icon="bluetooth"
                    iconBackgroundColor="#007AFF"
                    label="Bluetooth"
                    value="On"
                    onPress={() => handleMenuPress('Bluetooth')}
                />
                <ProfileMenuItem
                    icon="cellular"
                    iconBackgroundColor="#34C759"
                    label="Cellular"
                    onPress={() => handleMenuPress('Cellular')}
                />
                <ProfileMenuItem
                    icon="link"
                    iconBackgroundColor="#34C759"
                    label="Personal Hotspot"
                    value="Off"
                    onPress={() => handleMenuPress('Personal Hotspot')}
                />
            </View>

            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <ProfileMenuItem
                    icon="newspaper"
                    iconBackgroundColor="#007AFF"
                    label="Daily Digest"
                    value="Berita AI"
                    onPress={() => router.push('/digest-settings' as any)}
                />
                <ProfileMenuItem
                    icon="notifications"
                    iconBackgroundColor="#FF3B30"
                    label="Notifications"
                    onPress={() => handleMenuPress('Notifications')}
                />
                <ProfileMenuItem
                    icon="volume-high"
                    iconBackgroundColor="#FF2D55"
                    label="Sounds & Haptics"
                    onPress={() => handleMenuPress('Sounds & Haptics')}
                />
                <ProfileMenuItem
                    icon="moon-outline"
                    iconBackgroundColor="#5856D6"
                    label="Focus"
                    onPress={() => handleMenuPress('Focus')}
                />
                <ProfileMenuItem
                    icon="hourglass"
                    iconBackgroundColor="#5856D6"
                    label="Screen Time"
                    onPress={() => handleMenuPress('Screen Time')}
                />
            </View>

            {/* Appearance Section */}
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
                    icon="text-outline"
                    iconBackgroundColor="#007AFF"
                    label="Display & Brightness"
                    onPress={() => handleMenuPress('Display & Brightness')}
                />
                <ProfileMenuItem
                    icon="home"
                    iconBackgroundColor="#007AFF"
                    label="Home Screen & App Library"
                    onPress={() => handleMenuPress('Home Screen')}
                />
                <ProfileMenuItem
                    icon="accessibility"
                    iconBackgroundColor="#007AFF"
                    label="Accessibility"
                    onPress={() => handleMenuPress('Accessibility')}
                />
            </View>

            {/* Privacy Section */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <ProfileMenuItem
                    icon="hand-left"
                    iconBackgroundColor="#007AFF"
                    label="Privacy & Security"
                    onPress={() => handleMenuPress('Privacy & Security')}
                />
            </View>

            {/* Apps Section */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid }]}>
                <View style={[styles.sectionHeader]}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPS</Text>
                </View>
                <ProfileMenuItem
                    icon="chatbubble"
                    iconBackgroundColor="#34C759"
                    label="Messages"
                    onPress={() => handleMenuPress('Messages')}
                />
                <ProfileMenuItem
                    icon="camera"
                    iconBackgroundColor="#8E8E93"
                    label="Camera"
                    onPress={() => handleMenuPress('Camera')}
                />
                <ProfileMenuItem
                    icon="images"
                    iconBackgroundColor="#FF9500"
                    label="Photos"
                    onPress={() => handleMenuPress('Photos')}
                />
            </View>

            {/* About */}
            <View style={[styles.section, { backgroundColor: colors.cardSolid, marginBottom: 40 }]}>
                <ProfileMenuItem
                    icon="information-circle"
                    iconBackgroundColor="#8E8E93"
                    label="About"
                    onPress={() => handleMenuPress('About')}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    headerSection: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    largeTitle: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: 0.4,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 12,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.4,
    },
    profileSubtitle: {
        fontSize: 13,
        marginTop: 2,
        letterSpacing: -0.2,
    },
    searchSuggestion: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 8,
    },
    searchText: {
        fontSize: 17,
        letterSpacing: -0.4,
    },
    section: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: -0.2,
        textTransform: 'uppercase',
    },
    switch: {
        transform: Platform.OS === 'ios' ? [] : [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
});
