import React, { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Configure RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Islamic-inspired theme colors
const IslamicTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2D5D31', // Deep Islamic green
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#1F2937',
    border: '#E5E7EB',
    notification: '#D4AF37', // Islamic gold
  },
};

const IslamicDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4A7C59', // Medium green for dark mode
    background: '#1F2937',
    card: '#374151',
    text: '#F9FAFB',
    border: '#4B5563',
    notification: '#D4AF37', // Islamic gold
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Load Cairo fonts
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const theme = colorScheme === 'dark' ? IslamicDarkTheme : IslamicTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <Stack screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontFamily: 'Cairo_600SemiBold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        }}>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal', 
              title: 'تفاصيل الحاج',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#FFFFFF',
            }} 
          />
          <Stack.Screen 
            name="scanner" 
            options={{ 
              title: 'مسح NFC',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#FFFFFF',
            }} 
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.primary} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
