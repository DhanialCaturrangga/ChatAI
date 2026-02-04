import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useColors } from '../context/ThemeContext';

interface TypingIndicatorProps {
    isVisible: boolean;
}

export default function TypingIndicator({ isVisible }: TypingIndicatorProps) {
    const colors = useColors();
    const dot1 = useRef(new Animated.Value(0.4)).current;
    const dot2 = useRef(new Animated.Value(0.4)).current;
    const dot3 = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        if (!isVisible) return;

        const createAnimation = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0.4,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animation = Animated.parallel([
            createAnimation(dot1, 0),
            createAnimation(dot2, 200),
            createAnimation(dot3, 400),
        ]);

        animation.start();

        return () => {
            animation.stop();
            dot1.setValue(0.4);
            dot2.setValue(0.4);
            dot3.setValue(0.4);
        };
    }, [isVisible, dot1, dot2, dot3]);

    if (!isVisible) return null;

    const renderDot = (animatedValue: Animated.Value) => ({
        opacity: animatedValue,
        transform: [
            {
                translateY: animatedValue.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0, -3],
                }),
            },
        ],
    });

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.aiBubble }]}>
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.textTertiary },
                        renderDot(dot1)
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.textTertiary },
                        renderDot(dot2)
                    ]}
                />
                <Animated.View
                    style={[
                        styles.dot,
                        { backgroundColor: colors.textTertiary },
                        renderDot(dot3)
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        marginVertical: 4,
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
