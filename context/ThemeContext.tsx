import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import Colors from '../constants/Colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeType;
    colorScheme: 'light' | 'dark';
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const systemColorScheme = useSystemColorScheme();
    const [theme, setTheme] = useState<ThemeType>('system');

    const colorScheme: 'light' | 'dark' =
        theme === 'system'
            ? (systemColorScheme ?? 'light')
            : theme;

    const isDark = colorScheme === 'dark';

    const toggleTheme = () => {
        setTheme((current) => {
            if (current === 'light') return 'dark';
            if (current === 'dark') return 'light';
            return systemColorScheme === 'dark' ? 'light' : 'dark';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, setTheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function useColors() {
    const { colorScheme } = useTheme();
    return Colors[colorScheme];
}
