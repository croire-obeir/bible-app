import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import type { ComponentProps } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabsLayout() {
  return (
    <Tabs
  screenOptions={{
    headerShown: false,

    tabBarActiveTintColor: '#0a2d55',
    tabBarInactiveTintColor: '#8da0ba',

    tabBarStyle: {
      backgroundColor: '#fff',
      borderTopWidth: 0,
      height: 58,
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 70,
      borderRadius: 30,
      paddingBottom: 8,
      paddingTop: 5,
      elevation: 4,
      shadowColor: '#a0a0a0',
      shadowOpacity: 0.15,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowRadius: 12,
    },

    tabBarLabelStyle: {
      fontSize: 9,
      fontWeight: '600',
      marginTop: 2,
    },
  }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="book-outline" color={color} size={size} focused={focused} />,
        }}
      />
       <Tabs.Screen
        name="bible" // Points to app/screens/(tabs)/bible.tsx
        options={{
          title: 'BIBLE',
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
          title: 'LIBRARY',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="library-outline" color={color} size={size} focused={focused} />,
        }}
        />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size, focused }) => <TabIcon name="person-outline" color={color} size={size} focused={focused} />,
          tabBarButton: (props) => {
            const { onPress, ...rest } = props;
            return (
              <TouchableOpacity
                {...rest}
                onPress={async () => {
                  const storedData = await AsyncStorage.getItem('userprofile');
                  if (!storedData) {
                    router.push('/screens/Login?returnTo=/screens/Home');
                    return;
                  }
                  onPress?.();
                }}
              />
            );
          },
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
