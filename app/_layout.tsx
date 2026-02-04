import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useColors, useTheme } from '../context/ThemeContext';

function RootLayoutNav() {
  const colors = useColors();
  const { isDark } = useTheme();

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
