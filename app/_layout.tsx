import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider, useColors, useTheme } from '../context/ThemeContext';

// Default user ID (in production, get from auth)
const USER_ID = 'user-1';

function RootLayoutNav() {
  const colors = useColors();
  const { isDark } = useTheme();

  // Initialize push notifications (only on native, not web)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let cleanup: (() => void) | undefined;

    const setupNotifications = async () => {
      try {
        // Dynamic import to avoid web bundling issues
        const notifications = await import('../services/notifications');

        await notifications.initializePushNotifications(
          USER_ID,
          // On notification received while app is open
          (notification: any) => {
            console.log('Notification received:', notification.request.content.title);
          },
          // On notification tapped
          (response: any) => {
            const data = notifications.getNotificationData(response);
            if (data.type === 'digest' && data.digestId) {
              // Navigate to digest detail
              router.push(`/digest/${data.digestId}` as any);
            }
          }
        );

        cleanup = () => notifications.cleanupNotificationListeners();
      } catch (error) {
        console.log('Push notifications not available:', error);
      }
    };

    setupNotifications();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.tabBarBackground,
          },
          headerTintColor: colors.tint,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
            color: colors.text,
          },
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          contentStyle: {
            backgroundColor: colors.background,
          },
          // iOS-style animations
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: true,
            title: 'Chat',
          }}
        />
        <Stack.Screen
          name="digest-settings"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="digest/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
