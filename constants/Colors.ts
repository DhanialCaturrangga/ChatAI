// iOS 26 Messages Style - Glassmorphic Design
// Modern Apple-style color palette with translucent effects

const iOSBlue = '#007AFF';
const iOSGreen = '#34C759';
const iOSGray = '#8E8E93';

export default {
  light: {
    // Primary colors
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',

    // Background colors with glassmorphism support
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',
    card: 'rgba(255, 255, 255, 0.72)',
    cardSolid: '#FFFFFF',

    // Glass effect colors
    glass: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.3)',
    glassBlur: 'rgba(255, 255, 255, 0.85)',

    // iOS accent colors
    tint: iOSBlue,
    tintSecondary: '#5856D6',
    success: iOSGreen,
    error: '#FF3B30',
    warning: '#FF9500',

    // Tab bar
    tabIconDefault: '#999999',
    tabIconSelected: iOSBlue,
    tabBarBackground: 'rgba(249, 249, 249, 0.94)',

    // Message bubbles (iOS style)
    userBubble: iOSBlue,
    userBubbleText: '#FFFFFF',
    aiBubble: '#E9E9EB',
    aiBubbleText: '#000000',

    // Input area
    inputBackground: 'rgba(118, 118, 128, 0.12)',
    inputBorder: 'rgba(60, 60, 67, 0.12)',
    inputPlaceholder: 'rgba(60, 60, 67, 0.3)',

    // Borders and separators
    border: 'rgba(60, 60, 67, 0.12)',
    separator: 'rgba(60, 60, 67, 0.29)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    // Primary colors
    text: '#FFFFFF',
    textSecondary: 'rgba(235, 235, 245, 0.6)',
    textTertiary: '#8E8E93',

    // Background colors with glassmorphism support
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    card: 'rgba(28, 28, 30, 0.72)',
    cardSolid: '#1C1C1E',

    // Glass effect colors
    glass: 'rgba(30, 30, 30, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassBlur: 'rgba(28, 28, 30, 0.85)',

    // iOS accent colors
    tint: '#0A84FF',
    tintSecondary: '#5E5CE6',
    success: '#30D158',
    error: '#FF453A',
    warning: '#FF9F0A',

    // Tab bar
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    tabBarBackground: 'rgba(28, 28, 30, 0.94)',

    // Message bubbles (iOS style)
    userBubble: '#0A84FF',
    userBubbleText: '#FFFFFF',
    aiBubble: '#3A3A3C',
    aiBubbleText: '#FFFFFF',

    // Input area
    inputBackground: 'rgba(118, 118, 128, 0.24)',
    inputBorder: 'rgba(84, 84, 88, 0.65)',
    inputPlaceholder: 'rgba(235, 235, 245, 0.3)',

    // Borders and separators
    border: 'rgba(84, 84, 88, 0.65)',
    separator: 'rgba(84, 84, 88, 0.65)',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

// Glassmorphism style helpers
export const glassStyle = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dark: {
    backgroundColor: 'rgba(28, 28, 30, 0.72)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};
