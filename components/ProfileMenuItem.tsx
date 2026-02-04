import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '../context/ThemeContext';

interface ProfileMenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showArrow?: boolean;
    danger?: boolean;
    rightComponent?: React.ReactNode;
    iconBackgroundColor?: string;
}

export default function ProfileMenuItem({
    icon,
    label,
    value,
    onPress,
    showArrow = true,
    danger = false,
    rightComponent,
    iconBackgroundColor,
}: ProfileMenuItemProps) {
    const colors = useColors();

    const textColor = danger ? colors.error : colors.text;
    const defaultIconBg = danger ? colors.error : colors.tint;
    const iconBg = iconBackgroundColor || defaultIconBg;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !rightComponent}
            style={styles.container}
            activeOpacity={onPress ? 0.5 : 1}
        >
            {/* iOS-style icon container */}
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={18} color="#FFFFFF" />
            </View>

            <View style={[styles.content, { borderBottomColor: colors.separator }]}>
                <View style={styles.labelContainer}>
                    <Text style={[styles.label, { color: textColor }]}>{label}</Text>
                </View>

                <View style={styles.rightContent}>
                    {rightComponent ? (
                        rightComponent
                    ) : (
                        <>
                            {value && (
                                <Text style={[styles.value, { color: colors.textTertiary }]}>{value}</Text>
                            )}
                            {showArrow && onPress && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.textTertiary}
                                    style={styles.chevron}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        backgroundColor: 'transparent',
        minHeight: 44,
    },
    iconContainer: {
        width: 29,
        height: 29,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 11,
        paddingRight: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    labelContainer: {
        flex: 1,
    },
    label: {
        fontSize: 17,
        fontWeight: '400',
        letterSpacing: -0.4,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    value: {
        fontSize: 17,
        fontWeight: '400',
        letterSpacing: -0.4,
    },
    chevron: {
        marginLeft: 4,
    },
});
