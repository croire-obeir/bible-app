import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
//sqlite dependencies
import { Suspense } from 'react'; 
import { ActivityIndicator, View } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite'; 

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* 1. Wrap everything in Suspense to handle the DB loading state */}
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }>
        {/* 2. Wrap the Stack in the SQLiteProvider */}
        <SQLiteProvider 
          databaseName="lsg_1910.db" 
          assetSource={{ assetId: require('../assets/lsg_1910.db') }}
          useSuspense
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="screens/index" />
            <Stack.Screen name="screens/Login" />
            <Stack.Screen name="screens/Register" />
            <Stack.Screen name="screens/(tabs)" />
            <Stack.Screen name="Bible" />
            <Stack.Screen name="Audios" />
            <Stack.Screen name="Enseignements" />
            <Stack.Screen name="Documents" />
          </Stack>
        </SQLiteProvider>
      </Suspense>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
