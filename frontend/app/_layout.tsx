
import { Suspense, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { restoreSession } from '../api/services/authServices';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

function StartupAuth() {
  const rootNavigationState = useRootNavigationState();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!rootNavigationState?.key || initialized) {
      return;
    }

    const initializeApp = async () => {
      try {
        const onboardingCompleted =
          await AsyncStorage.getItem(ONBOARDING_KEY);

        // First launch:
        // Let screens/index handle onboarding.
        if (onboardingCompleted !== 'true') {
          setInitialized(true);
          return;
        }

        // Returning user:
        // Check access/refresh token.
        const authenticated = await restoreSession();

        if (authenticated) {
          router.replace('/screens/(tabs)/Home');
        } else {
          router.replace('/screens/AccountChoice');
        }

      } catch (error) {
        console.error(
          'Error initializing application:',
          error
        );

        router.replace('/screens/AccountChoice');

      } finally {
        setInitialized(true);
      }
    };

    initializeApp();

  }, [rootNavigationState?.key, initialized]);

  return null;
}

export default function RootLayout() {
  const colorScheme = 'light';

  return (
    <ThemeProvider
      value={
        colorScheme === 'light'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Suspense
        fallback={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <SQLiteProvider
          databaseName="lsg_1910.db"
          assetSource={{
            assetId: require('../assets/lsg_1910.db'),
          }}
          useSuspense
        >
          <StartupAuth />

          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="screens/index" />

            <Stack.Screen name="screens/AccountChoice" />

            <Stack.Screen name="screens/Login" />

            <Stack.Screen name="screens/Register" />

            <Stack.Screen name="screens/(tabs)" />

            <Stack.Screen name="screens/VersionSelect" />
             <Stack.Screen name="screens/SearchByTopic" />
          </Stack>
        </SQLiteProvider>
      </Suspense>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}