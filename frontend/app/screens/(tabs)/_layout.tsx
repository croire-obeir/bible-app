import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { ComponentProps } from 'react';

export default function TabsLayout() {
  return (
    <Tabs
  screenOptions={{
    headerShown: false,

    tabBarActiveTintColor: '#D4AF37',
    tabBarInactiveTintColor: '#8da0ba',

    tabBarStyle: {
      backgroundColor: '#f6f4f3',
      borderTopWidth: 0,
      height: 65,
      position: 'absolute',
      
       left: '11%',
      bottom: 60,
      borderRadius: 60,
      paddingBottom: 10,
      paddingTop: 7,
      elevation: 0,
      shadowColor: '#88500b',
      shadowOpacity: 0.12,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowRadius: 12,
    },

    tabBarLabelStyle: {
      fontSize: 15,
      fontWeight: '600',
    },
  }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="book-outline" color={color} size={size} focused={focused} />,
        }}
      />
       <Tabs.Screen
        name="bible" // Points to app/screens/(tabs)/bible.tsx
        options={{
          title: 'Bible',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="book-outline" color={color} size={size} focused={focused} />,
        }}
        />
     <Tabs.Screen
        name="Videos" // Points to app/screens/(tabs)/videos.tsx
        options={{
          href: null,
          tabBarIcon: ({ color, size }) => <Ionicons name="play-circle" size={size} color={color} />,
        }}
        />

      <Tabs.Screen
        name="Audios" // Points to app/screens/(tabs)/audios.tsx
        options={{
          href: null,
          tabBarIcon: ({ color, size }) => <Ionicons name="musical-notes" size={size} color={color} />,
        }}
        />

      <Tabs.Screen
        name="Documents" // Points to app/screens/(tabs)/documents.tsx
        options={{
          title: 'Bibliothèque',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="library-outline" color={color} size={size} focused={focused} />,
        }}
        />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="person-outline" color={color} size={size} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, size, focused }: { name: ComponentProps<typeof Ionicons>['name']; color: string; size: number; focused: boolean }) {
  return <View style={styles.icon}><Ionicons name={name} size={size} color={color} />{focused && <View style={styles.dot} />}</View>;
}

const styles = StyleSheet.create({
  icon: { alignItems: 'center', minHeight: 24 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D4AF37', marginTop: 2 },
});
