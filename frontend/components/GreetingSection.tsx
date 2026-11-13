
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GreetingSection = () => {
  const [username, setUsername] = useState('');
  const [greeting, setGreeting] = useState('Bonjour');

  useEffect(() => {
    const loadGreeting = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('userprofile');

        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setUsername(profile.username?.trim() || '');
        }

        const hour = new Date().getHours();

        setGreeting(
          hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour'
        );

      } catch (error) {
        console.error('Error loading greeting:', error);
      }
    };

    loadGreeting();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.greetingTitle}>
        {username
          ? `${greeting} ${username}`
          : `${greeting} 👋`}
      </Text>

      <Text style={styles.greetingSubtitle}>
        Heureux de vous retrouver
      </Text>
    </View>
  );
};

export default GreetingSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 20,
  },

  greetingTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.6,
  },

  greetingSubtitle: {
    fontSize: 13,
    color: '#8A8F98',
    marginTop: 5,
    fontWeight: '400',
  },
});
