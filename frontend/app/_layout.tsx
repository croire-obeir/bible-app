
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
import { Asset } from 'expo-asset';
import { WebView } from 'react-native-webview';

import { restoreSession } from '../api/services/authServices';
import {NotificationProvider} from '../components/notification-context';
import { registerInstallation } from '../api/services/installationService';

const ONBOARDING_KEY = 'hasCompletedOnboarding';
const STARTUP_ANIMATION_HTML = require('../assets/images/Croire & Obéir – Animation de démarrage (1).html');

function StartupAnimation() {
  const [animationUri, setAnimationUri] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let active = true;
    const asset = Asset.fromModule(STARTUP_ANIMATION_HTML);

    asset.downloadAsync().then(() => {
      if (active) setAnimationUri(asset.localUri ?? asset.uri);
    }).catch((error) => {
      console.warn('Impossible de charger l’animation de démarrage:', error);
      if (active) setVisible(false);
    });

    const fallbackTimer = setTimeout(() => setVisible(false), 8000);
    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <View
      pointerEvents="auto"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: '#ffffff',
      }}
    >
      {animationUri ? (
        <WebView
          source={{ uri: animationUri }}
          originWhitelist={['*']}
          javaScriptEnabled
          onMessage={() => setVisible(false)}
          injectedJavaScript="setTimeout(function(){window.ReactNativeWebView.postMessage('animation-finished')}, 5200); true;"
          onError={() => setVisible(false)}
        />
      ) : null}
    </View>
  );
}

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

  useEffect(() => {
    registerInstallation();
  }, []);

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
          <NotificationProvider>
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
            <StartupAnimation />
          </NotificationProvider>
        </SQLiteProvider>
      </Suspense>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}