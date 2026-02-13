import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import TimePicker from '../components/TimePicker';
import TopicSelector from '../components/TopicSelector';
import { useColors } from '../context/ThemeContext';
import {
    getDigestSettings,
    localTimeToUTC,
    saveDigestSettings,
    testDigestGeneration,
    utcTimeToLocal,
} from '../services/digestApi';

// Default user ID (in production, get from auth)
const USER_ID = 'user-1';

// Cross-platform alert helper
function showAlert(title: string, message: string, onOk?: () => void) {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        onOk?.();
    } else {
        Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
}

export default function DigestSettingsScreen() {
    const colors = useColors();

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [digestTime, setDigestTime] = useState(new Date());
    const [selectedTopics, setSelectedTopics] = useState<string[]>(['technology']);
    const [customPrompt, setCustomPrompt] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Load settings
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await getDigestSettings(USER_ID);

            if (settings) {
                setEnabled(settings.enabled);
                setSelectedTopics(settings.topics || ['technology']);
                setCustomPrompt(settings.customPrompt || '');

                // Convert UTC time to local
                if (settings.digestTime) {
                    const { hours, minutes } = utcTimeToLocal(settings.digestTime);
                    const time = new Date();
                    time.setHours(hours, minutes, 0, 0);
                    setDigestTime(time);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            setStatusMessage('⚠️ Gagal memuat pengaturan');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (selectedTopics.length === 0) {
            showAlert('Error', 'Pilih minimal 1 topik');
            return;
        }

        try {
            setSaving(true);
            setStatusMessage('💾 Menyimpan pengaturan...');

            // Convert local time to UTC
            const utcTime = localTimeToUTC(
                digestTime.getHours(),
                digestTime.getMinutes()
            );

            console.log('Saving settings:', { userId: USER_ID, digestTime: utcTime, topics: selectedTopics, enabled });

            const result = await saveDigestSettings({
                userId: USER_ID,
                digestTime: utcTime,
                topics: selectedTopics,
                customPrompt,
                enabled,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            console.log('Save result:', result);

            if (result) {
                if (enabled) {
                    // Generate first digest immediately and save to history
                    setStatusMessage('🤖 Membuat digest pertama...');

                    const digestResult = await testDigestGeneration({
                        topics: selectedTopics,
                        customPrompt,
                        userId: USER_ID,
                        sendNotification: false,
                    });

                    console.log('Digest generated:', digestResult.success);

                    if (digestResult.success) {
                        setStatusMessage('✅ Berhasil! Digest tersimpan di History');
                        showAlert(
                            'Berhasil! 🎉',
                            'Pengaturan tersimpan dan digest pertama sudah dibuat! Buka tab Digest untuk melihatnya.',
                            () => router.back()
                        );
                    } else {
                        setStatusMessage('⚠️ Settings tersimpan, tapi digest gagal dibuat');
                        showAlert(
                            'Pengaturan Tersimpan ✅',
                            `Settings disimpan, tapi digest gagal di-generate: ${digestResult.error || 'Unknown error'}`,
                            () => router.back()
                        );
                    }
                } else {
                    setStatusMessage('✅ Tersimpan (nonaktif)');
                    showAlert('Berhasil! ✅', 'Pengaturan disimpan (Digest nonaktif)', () => router.back());
                }
            } else {
                setStatusMessage('❌ Gagal menyimpan');
                showAlert('Error', 'Gagal menyimpan pengaturan. Pastikan backend berjalan di localhost:3001');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setStatusMessage(`❌ Error: ${error}`);
            showAlert('Error', `Terjadi kesalahan: ${error}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTestDigest = async () => {
        try {
            setTesting(true);
            setStatusMessage('🧪 Generating test digest...');

            console.log('Testing digest with topics:', selectedTopics);

            const result = await testDigestGeneration({
                topics: selectedTopics,
                customPrompt,
                userId: USER_ID,
                sendNotification: false,
            });

            console.log('Test result:', result);

            if (result.success) {
                setStatusMessage('✅ Test berhasil!');
                showAlert(
                    'Test Berhasil! 🎉',
                    result.content
                        ? `Preview:\n\n${result.content.substring(0, 300)}...`
                        : 'Digest berhasil di-generate!'
                );
            } else {
                setStatusMessage(`❌ Test gagal: ${result.error}`);
                showAlert('Test Gagal', result.error || 'Gagal generate digest. Periksa GEMINI_API_KEY di backend.');
            }
        } catch (error) {
            console.error('Error testing digest:', error);
            setStatusMessage(`❌ Error: ${error}`);
            showAlert('Error', `Gagal test: ${error}`);
        } finally {
            setTesting(false);
        }
    };

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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={colors.tint} />
                    <Text style={[styles.backText, { color: colors.tint }]}>Kembali</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Daily Digest</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Status Message */}
                {statusMessage !== '' && (
                    <View style={[styles.statusBar, { backgroundColor: colors.inputBackground }]}>
                        <Text style={[styles.statusText, { color: colors.text }]}>
                            {statusMessage}
                        </Text>
                    </View>
                )}

                {/* Enable Toggle */}
                <View style={[styles.card, { backgroundColor: colors.cardSolid }]}>
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <View style={[styles.iconCircle, { backgroundColor: colors.tint }]}>
                                <Ionicons name="newspaper" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.toggleText}>
                                <Text style={[styles.toggleTitle, { color: colors.text }]}>
                                    Aktifkan Daily Digest
                                </Text>
                                <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
                                    Terima ringkasan berita harian
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={enabled}
                            onValueChange={setEnabled}
                            trackColor={{ false: colors.inputBackground, true: colors.success }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Settings (only show when enabled) */}
                {enabled && (
                    <>
                        {/* Time Picker */}
                        <View style={[styles.card, { backgroundColor: colors.cardSolid }]}>
                            <TimePicker
                                value={digestTime}
                                onChange={setDigestTime}
                                label="Waktu Terima Digest"
                            />
                        </View>

                        {/* Topic Selector */}
                        <View style={[styles.card, { backgroundColor: colors.cardSolid }]}>
                            <TopicSelector
                                selectedTopics={selectedTopics}
                                onChange={setSelectedTopics}
                                label="Topik Berita"
                                maxSelection={5}
                            />
                        </View>

                        {/* Custom Prompt */}
                        <View style={[styles.card, { backgroundColor: colors.cardSolid }]}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                INSTRUKSI KHUSUS (OPSIONAL)
                            </Text>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: colors.inputBackground,
                                        color: colors.text,
                                    },
                                ]}
                                placeholder="Contoh: Rangkum berita AI di Indonesia..."
                                placeholderTextColor={colors.textTertiary}
                                value={customPrompt}
                                onChangeText={setCustomPrompt}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                            <Text style={[styles.hint, { color: colors.textTertiary }]}>
                                💡 Berikan instruksi spesifik untuk AI, misal fokus pada topik atau wilayah tertentu
                            </Text>
                        </View>

                        {/* Test Notification Button */}
                        <TouchableOpacity
                            style={[styles.testButton, { borderColor: colors.tint }]}
                            onPress={handleTestDigest}
                            disabled={testing}
                        >
                            {testing ? (
                                <ActivityIndicator size="small" color={colors.tint} />
                            ) : (
                                <>
                                    <Ionicons name="flask" size={20} color={colors.tint} />
                                    <Text style={[styles.testButtonText, { color: colors.tint }]}>
                                        Test Generate Digest
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Info Card */}
                        <View style={[styles.infoCard, { backgroundColor: colors.tint + '15' }]}>
                            <Ionicons name="information-circle" size={20} color={colors.tint} />
                            <Text style={[styles.infoText, { color: colors.text }]}>
                                Digest akan dikirim melalui push notification pada waktu yang dipilih.
                                Pastikan notifikasi diizinkan untuk menerima digest.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        { backgroundColor: colors.tint },
                        saving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text style={styles.saveButtonText}>Simpan Pengaturan</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
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
        paddingBottom: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 17,
        marginLeft: 4,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    placeholder: {
        width: 80,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    statusBar: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 14,
        textAlign: 'center',
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        marginLeft: 12,
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    toggleSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textInput: {
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        minHeight: 80,
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
        lineHeight: 18,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        gap: 8,
        marginBottom: 16,
    },
    testButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 10,
        gap: 10,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
});
