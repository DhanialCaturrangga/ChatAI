import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useColors } from '../context/ThemeContext';

interface Topic {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

const TOPICS: Topic[] = [
    { id: 'technology', label: 'Teknologi', icon: 'laptop-outline', color: '#007AFF' },
    { id: 'business', label: 'Bisnis', icon: 'briefcase-outline', color: '#34C759' },
    { id: 'sports', label: 'Olahraga', icon: 'football-outline', color: '#FF9500' },
    { id: 'entertainment', label: 'Hiburan', icon: 'film-outline', color: '#FF2D55' },
    { id: 'science', label: 'Sains', icon: 'flask-outline', color: '#5856D6' },
    { id: 'politics', label: 'Politik', icon: 'business-outline', color: '#8E8E93' },
    { id: 'health', label: 'Kesehatan', icon: 'heart-outline', color: '#FF3B30' },
    { id: 'world', label: 'Dunia', icon: 'globe-outline', color: '#00C7BE' },
];

interface TopicSelectorProps {
    selectedTopics: string[];
    onChange: (topics: string[]) => void;
    label?: string;
    maxSelection?: number;
}

export default function TopicSelector({
    selectedTopics,
    onChange,
    label = 'Pilih Topik',
    maxSelection = 5,
}: TopicSelectorProps) {
    const colors = useColors();

    const toggleTopic = (topicId: string) => {
        if (selectedTopics.includes(topicId)) {
            // Remove topic
            onChange(selectedTopics.filter(id => id !== topicId));
        } else {
            // Add topic (if under max)
            if (selectedTopics.length < maxSelection) {
                onChange([...selectedTopics, topicId]);
            }
        }
    };

    const isSelected = (topicId: string) => selectedTopics.includes(topicId);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
                <Text style={[styles.counter, { color: colors.textTertiary }]}>
                    {selectedTopics.length}/{maxSelection}
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topicsRow}
            >
                {TOPICS.map((topic) => {
                    const selected = isSelected(topic.id);
                    return (
                        <TouchableOpacity
                            key={topic.id}
                            style={[
                                styles.topicChip,
                                {
                                    backgroundColor: selected ? topic.color : colors.inputBackground,
                                    borderColor: selected ? topic.color : 'transparent',
                                },
                            ]}
                            onPress={() => toggleTopic(topic.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={topic.icon}
                                size={16}
                                color={selected ? '#FFFFFF' : topic.color}
                            />
                            <Text
                                style={[
                                    styles.topicLabel,
                                    { color: selected ? '#FFFFFF' : colors.text },
                                ]}
                            >
                                {topic.label}
                            </Text>
                            {selected && (
                                <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedTopics.length === 0 && (
                <Text style={[styles.hint, { color: colors.warning }]}>
                    Pilih minimal 1 topik
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    counter: {
        fontSize: 13,
    },
    topicsRow: {
        flexDirection: 'row',
        gap: 8,
        paddingRight: 16,
    },
    topicChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
    },
    topicLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    hint: {
        fontSize: 12,
        marginTop: 8,
    },
});
