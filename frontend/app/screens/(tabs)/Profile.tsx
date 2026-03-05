import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleNameEmailChange, handleDeleteAccount } from '../../../api/services/userDataUpdateServices';

const STORAGE_KEY = '@user_profile_data';

interface UserData {
  username: string;
  email: string;
  userId: string;
  avatar: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();

  // --- États ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
    userId: '',
    avatar: null,
  });
  // const [tempData, setTempData] = useState<UserData>({ ...userData });

  // --- Chargement des données au montage ---

  const loadProfileData = async () => {
    try {
      
      const storedData = await AsyncStorage.getItem('userprofile');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      } else {
        Alert.alert("Aucun profil trouvé", "Veuillez vous connecter pour voir votre profil.");
        router.push('/screens/Login');
      }
    } catch (error) {
      console.error("Erreur chargement profil", error);
    } finally {
      setIsLoading(false);
    }
  };

   useEffect(() => {
    loadProfileData();
   }, []);

  // --- Fonctions de gestion ---

  const handleLogout =async () => {
    try {
      // 1. Remove the JWT from the encrypted hardware storage
      await SecureStore.deleteItemAsync('userToken');
      // 2. Remove the user profile from standard storage
      await AsyncStorage.removeItem('userprofile');
      // 4. Trigger the Alert now that storage is empty
      Alert.alert(
        "Déconnexion",
        "Vous avez été déconnecté avec succès.",
        [
          { 
            text: "OK", 
            onPress: () => {
              router.push('/screens/Login');
            } 
          }
        ],
        { cancelable: false } // Ensures user must click OK
      );

    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Erreur", "Un problème est survenu lors de la déconnexion.");
    }
  };

  const handleChangePassword = () => {
    Alert.prompt(
      "Changer le mot de passe",
      "Entrez votre nouveau mot de passe :",
      async (newPassword) => {
        if (newPassword && newPassword.length >= 4) {
          try {
            const storedUsers = await AsyncStorage.getItem('@all_users');
            let users = storedUsers ? JSON.parse(storedUsers) : [];
            
            // Mise à jour dans la "base de données" globale
            users = users.map((u: any) => 
              u.email.toLowerCase() === userData.email.toLowerCase() 
              ? { ...u, password: newPassword } 
              : u
            );
            
            await AsyncStorage.setItem('@all_users', JSON.stringify(users));
            Alert.alert("Succès", "Votre mot de passe a été mis à jour.");
          } catch (e) {
            Alert.alert("Erreur", "Impossible de mettre à jour le mot de passe.");
          }
        } else {
          Alert.alert("Erreur", "Le mot de passe est trop court.");
        }
      },
      "secure-text"
    );
  };

  // const pickImage = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert("Permission refusée", "Accès galerie requis.");
  //     return;
  //   }

  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 1,
  //   });

  //   if (!result.canceled && result.assets && result.assets.length > 0) {
  //     const newAvatar = result.assets[0].uri;
  //     if (isEditing) {
  //       setTempData({ ...tempData, avatar: newAvatar });
  //     } else {
  //       const newData = { ...userData, avatar: newAvatar };
  //       setUserData(newData);
  //       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  //     }
  //   }
  // };

  const saveChanges = async () => {
    const result = await handleNameEmailChange(userData.username, userData.email, userData.userId);
    if (result?.success) {
          Alert.alert("Succès", "Votre nom et email ont été mis à jour.");
          setIsEditing(false);
        }
  };

  const cancelChanges = () => {
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const result = await handleDeleteAccount(userData.userId);
              if (result?.success) {
                Alert.alert("Compte supprimé", "Votre compte a été supprimé avec succès.");
                router.push('/screens/Login');
              } else {
                Alert.alert("Erreur", "Impossible de supprimer le compte.");
              }
            } catch (e) {
              Alert.alert("Erreur", "Impossible de supprimer le compte.");
            }
          } 
        }
      ],
      { cancelable: false }
    );
  }

  // Tes items de menu d'origine
  const menuItems = [
    { id: '2', title: 'Supprimer votre compte', icon: 'lock-closed-outline', onPress: handleDelete },
    { id: '3', title: 'Changer le mot de passe', icon: 'lock-closed-outline', onPress: handleChangePassword },
    { id: '4', title: 'Gérer les préférences', icon: 'settings-outline', onPress: () => console.log('Prefs') },
    { id: '5', title: 'Notifications', icon: 'notifications-outline', onPress: () => console.log('Notifs') },
  ];

  const currentAvatar =  userData.avatar;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Utilisateur</Text>
          <View style={styles.placeholder} />
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <LinearGradient colors={['#0a2d55', '#1565c0']} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={() => Alert.alert("Fonctionnalité à venir", "La modification de l'avatar sera disponible dans une future mise à jour.")}>
                <View style={styles.avatar}>
                  {currentAvatar ? (
                    <Image source={{ uri: currentAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={60} color="#D4AF37" />
                  )}
                </View>
                <View style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity> 
            </View>
            {isEditing ? (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={cancelChanges}>
                  <Text style={styles.actionButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={saveChanges}>
                  <Text style={styles.actionButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editProfileButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editProfileText}>Modifier le profil</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Ionicons name="person-outline" size={20} color="#D4AF37" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Nom complet</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.inputField}
                      value={userData.username}
                      onChangeText={(text) => setUserData({ ...userData, username: text })}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{userData.username}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Ionicons name="mail-outline" size={20} color="#D4AF37" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email</Text>
                   {isEditing ? (
                    <TextInput
                      style={styles.inputField}
                      value={userData.email}
                      onChangeText={(text) => setUserData({ ...userData, email: text })}
                    />
                  ) : (
                    <Text style={styles.infoValue}>{userData.email}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres du Compte</Text>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <View style={styles.menuContent}>
                  <Ionicons name={item.icon as any} size={20} color="#D4AF37" />
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#1565c0" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <TouchableOpacity style={styles.aboutItem}><Text style={styles.aboutText}>Version 1.0.0</Text></TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}><Text style={styles.aboutText}>Conditions d'utilisation</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.logoutGradient}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  bg: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#0a2d55' },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  placeholder: { width: 34 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  profileCard: { borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 25 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#D4AF37', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 12 },
  editProfileButton: { backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  editProfileText: { color: '#0a2d55', fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', gap: 10 },
  actionButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  saveButton: { backgroundColor: '#27ae60' },
  cancelButton: { backgroundColor: '#e74c3c' },
  actionButtonText: { color: '#fff', fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0a2d55', marginBottom: 12 },
  infoItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#D4AF37' },
  infoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoText: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 12, color: '#999' },
  infoValue: { fontSize: 14, color: '#0a2d55', fontWeight: '600' },
  inputField: { fontSize: 14, color: '#0a2d55', borderBottomWidth: 1, borderBottomColor: '#D4AF37' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10 },
  menuContent: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 14, color: '#0a2d55', fontWeight: '600', marginLeft: 15 },
  aboutItem: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10 },
  aboutText: { fontSize: 14, color: '#1565c0' },
  logoutButton: { borderRadius: 12, overflow: 'hidden', marginTop: 10 },
  logoutGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 10 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  bottomPadding: { height: 20 },
});