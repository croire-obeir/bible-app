import { Stack } from 'expo-router';

export default function BibleStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
      <Stack.Screen name="chapters" />  
    </Stack>
  );
}