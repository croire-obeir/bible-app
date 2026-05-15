import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';
import {
  handleDeleteAccount,
  handleNameEmailChange,
} from '@/api/services/userDataUpdateServices';

type UserData = {
  username: string;
  email: string;
  userId: string;
  avatar: string | null;
};

const emptyUser: UserData = {
  username: '',
  email: '',
  userId: '',
  avatar: null,
};

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(emptyUser);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userprofile');

        if (storedData) {
          setUserData(JSON.parse(storedData));
        } else {
          router.push('/screens/Login' as Href);
        }
      } catch {
        Alert.alert('Profil', 'Impossible de charger votre profil.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  const saveChanges = async () => {
    const result = await handleNameEmailChange(
      userData.username,
      userData.email,
      userData.userId
    );

    if (result?.success) {
      await AsyncStorage.setItem('userprofile', JSON.stringify(userData));
      setIsEditing(false);
      Alert.alert('Succès', 'Votre profil a été mis à jour.');
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await AsyncStorage.removeItem('userprofile');
      router.push('/screens/Login' as Href);
    } catch {
      Alert.alert('Erreur', 'Un problème est survenu lors de la déconnexion.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const result = await handleDeleteAccount(userData.userId);
            if (result?.success) {
              await AsyncStorage.removeItem('userprofile');
              await SecureStore.deleteItemAsync('userToken');
              router.push('/screens/Login' as Href);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    { title: 'Plan de lecture', icon: 'calendar-outline' },
    { title: 'Notifications', icon: 'notifications-outline' },
    { title: 'Paramètres', icon: 'settings-outline' },
    { title: 'Supprimer votre compte', icon: 'trash-outline', danger: true, onPress: handleDelete },
  ];

  return (
    <SacredPage activeTab="profile" showSearch={false}>
      {isLoading ? (
        <View style={styles.stateBlock}>
          <ActivityIndicator color={sacredColors.navy} />
        </View>
      ) : (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {userData.avatar ? (
                <Image source={{ uri: userData.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitial}>
                  {(userData.username || 'E').charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editFields}>
                <TextInput
                  value={userData.username}
                  onChangeText={(username) => setUserData({ ...userData, username })}
                  placeholder="Nom"
                  placeholderTextColor="#9AA2B2"
                  style={styles.input}
                />
                <TextInput
                  value={userData.email}
                  onChangeText={(email) => setUserData({ ...userData, email })}
                  placeholder="Email"
                  placeholderTextColor="#9AA2B2"
                  style={styles.input}
                />
              </View>
            ) : (
              <View style={styles.profileText}>
                <Text style={styles.userName}>{userData.username || 'Emmanuel'}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
              </View>
            )}

            <View style={styles.actionRow}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => setIsEditing(false)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={saveChanges}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryText}>Sauvegarder</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => setIsEditing(true)}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryText}>Modifier</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Préférences</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              activeOpacity={0.86}
              onPress={item.onPress}
              style={styles.menuCard}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
                  <Ionicons
                    name={item.icon as never}
                    size={22}
                    color={item.danger ? '#A5423A' : sacredColors.navy}
                  />
                </View>
                <Text style={[styles.menuText, item.danger && styles.menuTextDanger]}>
                  {item.title}
                </Text>
              </View>
          <Ionicons name="chevron-forward" size={20} color="#B2A98E" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity activeOpacity={0.86} onPress={handleLogout} style={styles.logout}>
            <Ionicons name="log-out-outline" size={22} color={sacredColors.white} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </>
      )}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  stateBlock: {
    alignItems: 'center',
    paddingVertical: 44,
  },
  profileCard: {
    backgroundColor: sacredColors.cream,
    borderRadius: 12,
    alignItems: 'center',
    padding: 24,
    marginBottom: 22,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: sacredColors.navy,
    borderColor: sacredColors.gold,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#FFE27A',
    fontFamily: 'serif',
    fontSize: 38,
    fontWeight: '800',
  },
  profileText: {
    alignItems: 'center',
  },
  userName: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '800',
  },
  userEmail: {
    color: '#687184',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  editFields: {
    width: '100%',
    gap: 8,
  },
  input: {
    height: 48,
    backgroundColor: sacredColors.white,
    borderRadius: 10,
    color: sacredColors.navy,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  primaryButton: {
    height: 42,
    minWidth: 118,
    borderRadius: 21,
    backgroundColor: sacredColors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryText: {
    color: sacredColors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    height: 42,
    minWidth: 92,
    borderRadius: 21,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: sacredColors.navy,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 23,
    fontStyle: 'italic',
    fontWeight: '800',
    marginBottom: 14,
  },
  menuCard: {
    minHeight: 68,
    backgroundColor: '#F1F0EF',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: '#F7E3DF',
  },
  menuText: {
    color: sacredColors.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  menuTextDanger: {
    color: '#A5423A',
  },
  logout: {
    height: 48,
    borderRadius: 24,
    backgroundColor: sacredColors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  logoutText: {
    color: sacredColors.white,
    fontSize: 14,
    fontWeight: '900',
  },
});
