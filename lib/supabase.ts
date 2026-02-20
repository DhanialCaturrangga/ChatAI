// Supabase client for React Native with Expo
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Platform-aware storage: web uses window.localStorage, native uses expo-sqlite polyfill
let storage: any;

if (Platform.OS === 'web') {
    // On web, use the native window.localStorage
    storage = typeof window !== 'undefined' ? window.localStorage : undefined;
} else {
    // On native (iOS/Android), install expo-sqlite localStorage polyfill
    require('expo-sqlite/localStorage/install');
    storage = localStorage;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // REQUIRED for React Native!
    },
});

// IMPORTANT: Handle app state changes to manage session refresh
// Without this, user will be logged out after ~1 hour
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default supabase;
