import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="Home" options={{ href: null }} />
      <Tabs.Screen name="Search" options={{ href: null }} />
      <Tabs.Screen name="Favorites" options={{ href: null }} />
      <Tabs.Screen name="Profile" options={{ href: null }} />
    </Tabs>
  );
}
