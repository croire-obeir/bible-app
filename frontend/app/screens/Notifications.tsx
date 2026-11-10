import React from 'react';
import { useNotifications } from '../../components/notification-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const router = useRouter();
  const { hasNewVideos, hasNewAudios } = useNotifications();

  const notifications = [
  ...(hasNewVideos
    ? [{
        id: 'videos',
        title: 'Nouvelles vidéos',
        description: 'De nouvelles vidéos sont disponibles.',
        icon: 'videocam-outline' as const,
        route: '/screens/(tabs)/Videos' as const,
      }]
    : []),

  ...(hasNewAudios
    ? [{
        id: 'audios',
        title: 'Nouveaux audios',
        description: 'De nouveaux enseignements audio sont disponibles.',
        icon: 'headset-outline' as const,
        route: '/screens/(tabs)/Audios' as const,
      }]
    : []),
];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F3E7" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0A2D55" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={styles.backButton} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.notificationCard}
              activeOpacity={0.8}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="#0A2D55"
                />
              </View>

              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>
                  {item.title}
                </Text>

                <Text style={styles.notificationDescription}>
                  {item.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#999999"
              />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#B7B190"
            />

            <Text style={styles.emptyTitle}>
              Aucune notification
            </Text>

            <Text style={styles.emptyDescription}>
              Aucune nouvelle notification pour le moment.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 100,
    backgroundColor: '#c7ba9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: 'serif',
    fontSize: 23,
    fontWeight: '700',
    color: '#233A59',
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3E7',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  notificationText: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A2D55',
    marginBottom: 5,
  },

  notificationDescription: {
    fontSize: 12,
    color: '#777777',
    lineHeight: 17,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A2D55',
    marginTop: 15,
    marginBottom: 7,
  },

  emptyDescription: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
});