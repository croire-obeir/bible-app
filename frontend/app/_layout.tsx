import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Écrans hors navigation par onglets (Auth) */}
        <Stack.Screen name="screens/index" />
        <Stack.Screen name="screens/Login" />
        <Stack.Screen name="screens/Register" />
       
        {/* L'écran principal qui contiendra tes onglets */}
        <Stack.Screen name="screens/(tabs)" />
        <Stack.Screen name="Bible" />
        <Stack.Screen name="Audios" />
        <Stack.Screen name="Enseignements" />
        <Stack.Screen name="Documents" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
