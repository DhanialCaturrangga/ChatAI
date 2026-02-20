import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../context/ThemeContext';

export default function AuthScreen() {
    const colors = useColors();
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUp(email.trim(), password, username.trim() || undefined);
                if (error) throw error;
                Alert.alert('Success', 'Account created! You are now logged in.');
            } else {
                const { error } = await signIn(email.trim(), password);
                if (error) throw error;
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo / Header */}
                <View style={styles.header}>
                    <View style={[styles.logoContainer, { backgroundColor: colors.tint }]}>
                        <Ionicons name="chatbubbles" size={48} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.appName, { color: colors.text }]}>ChatAI</Text>
                    <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                        Real-time messaging with AI
                    </Text>
                </View>

                {/* Form Card */}
                <View style={[styles.formCard, { backgroundColor: colors.cardSolid }]}>
                    <Text style={[styles.formTitle, { color: colors.text }]}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </Text>

                    {isSignUp && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Username</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                                <Ionicons name="person-outline" size={20} color={colors.textTertiary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Choose a username"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                            <Ionicons name="mail-outline" size={20} color={colors.textTertiary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="your@email.com"
                                placeholderTextColor={colors.inputPlaceholder}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                textContentType="emailAddress"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Min 6 characters"
                                placeholderTextColor={colors.inputPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                textContentType="password"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isSignUp ? 'Create Account' : 'Sign In'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={() => { setIsSignUp(!isSignUp); }}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                            <Text style={[styles.toggleTextAccent, { color: colors.tint }]}>
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: { elevation: 12 },
        }),
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    tagline: {
        fontSize: 15,
        letterSpacing: -0.2,
    },
    formCard: {
        borderRadius: 16,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: { elevation: 4 },
        }),
    },
    formTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.4,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
        letterSpacing: -0.2,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 48,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        letterSpacing: -0.3,
    },
    submitButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    toggleButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 8,
    },
    toggleText: {
        fontSize: 14,
        letterSpacing: -0.2,
    },
    toggleTextAccent: {
        fontWeight: '600',
    },
});
