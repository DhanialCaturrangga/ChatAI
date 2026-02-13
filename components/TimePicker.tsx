import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useColors } from '../context/ThemeContext';

interface TimePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
}

export default function TimePicker({ value, onChange, label = 'Waktu Digest' }: TimePickerProps) {
    const colors = useColors();
    const [showPicker, setShowPicker] = useState(false);

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const handleConfirm = () => {
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

            <TouchableOpacity
                style={[styles.timeButton, { backgroundColor: colors.inputBackground }]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.7}
            >
                <Text style={[styles.timeText, { color: colors.text }]}>
                    {formatTime(value)}
                </Text>
                <Text style={[styles.timeHint, { color: colors.textTertiary }]}>
                    Tap untuk ubah
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
                <Modal
                    visible={showPicker}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.cardSolid }]}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text style={[styles.modalButton, { color: colors.textSecondary }]}>
                                        Batal
                                    </Text>
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Pilih Waktu
                                </Text>
                                <TouchableOpacity onPress={handleConfirm}>
                                    <Text style={[styles.modalButton, { color: colors.tint }]}>
                                        Selesai
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={value}
                                mode="time"
                                display="spinner"
                                onChange={handleChange}
                                textColor={colors.text}
                                style={styles.picker}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showPicker && (
                    <DateTimePicker
                        value={value}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={handleChange}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
    },
    timeText: {
        fontSize: 28,
        fontWeight: '600',
        letterSpacing: 1,
    },
    timeHint: {
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(128,128,128,0.3)',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    modalButton: {
        fontSize: 17,
        fontWeight: '500',
    },
    picker: {
        height: 200,
    },
});
