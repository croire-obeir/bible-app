import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D4AF37', // Or
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#0a2d55', // Bleu foncé
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 30,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
       <Tabs.Screen
        name="bible" // Points to app/screens/(tabs)/bible.tsx
        options={{
          title: 'Bible',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
        />
     <Tabs.Screen
        name="Videos" // Points to app/screens/(tabs)/videos.tsx
        options={{
          title: 'Vidéos',
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={size} color={color} />,
        }}
        />

      <Tabs.Screen
        name="Audios" // Points to app/screens/(tabs)/audios.tsx
        options={{
          title: 'Audios',
          tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} />,
        }}
        />

      <Tabs.Screen
        name="Documents" // Points to app/screens/(tabs)/documents.tsx
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => <Ionicons name="document" size={size} color={color} />,
        }}
        />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}