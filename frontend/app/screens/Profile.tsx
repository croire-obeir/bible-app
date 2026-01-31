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
  ActivityIndicator, // Pour montrer le chargement
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. IMPORTATION

// Définition de la clé de stockage unique
const STORAGE_KEY = '@user_profile_data';

interface UserData {
  name: string;
  email: string;
  avatar: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // État de chargement initial
  
  const [userData, setUserData] = useState<UserData>({
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    avatar: null, 
  });

  const [tempData, setTempData] = useState<UserData>({ ...userData });

  // --- 2. CHARGEMENT DES DONNÉES AU DÉMARRAGE ---
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        // Si des données existent, on les charge
        const savedData = JSON.parse(jsonValue);
        setUserData(savedData);
        setTempData(savedData);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des données", e);
    } finally {
      setIsLoading(false); // On arrête le chargement
    }
  };

  // --- Fonctions ---

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Oui", 
        onPress: async () => {
          // Optionnel : Si vous voulez effacer les données locales à la déconnexion, décommentez la ligne ci-dessous
          // await AsyncStorage.removeItem(STORAGE_KEY); 
          router.push('/screens/Login');
        } 
      }
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Nous avons besoin d'accès à la galerie.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (isEditing) {
        setTempData({ ...tempData, avatar: result.assets[0].uri });
      } else {
        // Si on change l'image hors mode édition, on sauvegarde direct
        const newData = { ...userData, avatar: result.assets[0].uri };
        setUserData(newData);
        setTempData(newData); // Sync temp
        saveToStorage(newData); // Sauvegarde immédiate
      }
    }
  };

  // Fonction utilitaire pour sauvegarder dans AsyncStorage
  const saveToStorage = async (data: UserData) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de sauvegarder les données.");
    }
  };

  const startEditing = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  // --- 3. SAUVEGARDE DES MODIFICATIONS ---
  const saveChanges = async () => {
    setUserData({ ...tempData }); // Mise à jour de l'état local
    await saveToStorage(tempData); // Mise à jour du stockage persistant
    setIsEditing(false);
    Alert.alert("Succès", "Votre profil a été mis à jour et sauvegardé.");
  };

  const cancelChanges = () => {
    setIsEditing(false);
    setTempData({ ...userData }); // On remet les anciennes données dans temp
  };

  const menuItems = [
    { id: '2', title: 'Changer le mot de passe', icon: 'lock-closed-outline', onPress: () => console.log('Password') },
    { id: '3', title: 'Gérer les préférences', icon: 'settings-outline', onPress: () => console.log('Prefs') },
    { id: '4', title: 'Notifications', icon: 'notifications-outline', onPress: () => console.log('Notifs') },
  ];

  const currentAvatar = isEditing ? tempData.avatar : userData.avatar;

  // Affichage d'un chargement si on récupère encore les données
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/enregistrement.png')}
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
              <TouchableOpacity onPress={pickImage}>
                <View style={styles.avatar}>
                  {currentAvatar ? (
                    <Image 
                      source={{ uri: currentAvatar }} 
                      style={styles.avatarImage} 
                    />
                  ) : (
                    <Ionicons name="person" size={60} color="#D4AF37" />
                  )}
                </View>
                
                <View style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>
              {isEditing ? tempData.name : userData.name}
            </Text>

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
              <TouchableOpacity style={styles.editProfileButton} onPress={startEditing}>
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
                      value={tempData.name}
                      onChangeText={(text) => setTempData({ ...tempData, name: text })}
                      placeholder="Votre nom"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{userData.name}</Text>
                  )}
                </View>
              </View>
              {!isEditing && <Ionicons name="create-outline" size={20} color="#ccc" />}
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoContent}>
                <Ionicons name="mail-outline" size={20} color="#D4AF37" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.inputField}
                      value={tempData.email}
                      onChangeText={(text) => setTempData({ ...tempData, email: text })}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{userData.email}</Text>
                  )}
                </View>
              </View>
              {!isEditing && <Ionicons name="create-outline" size={20} color="#ccc" />}
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
            <Text style={styles.sectionTitle}>À propos de Croire & Obéir</Text>
            <TouchableOpacity style={styles.aboutItem}><Text style={styles.aboutText}>Version 1.0.0</Text></TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}><Text style={styles.aboutText}>Conditions d'utilisation</Text></TouchableOpacity>
            <TouchableOpacity style={styles.aboutItem}><Text style={styles.aboutText}>Politique de confidentialité</Text></TouchableOpacity>
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#0a2d55',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  placeholder: { width: 34 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },
  
  profileCard: {
    borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 25,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#D4AF37', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  editAvatarButton: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#D4AF37',
    justifyContent: 'center', alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2,
  },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 12 },
  
  editProfileButton: { backgroundColor: '#D4AF37', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  editProfileText: { color: '#0a2d55', fontWeight: '600', fontSize: 13 },
  actionButtonsRow: { flexDirection: 'row', gap: 10 },
  actionButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  saveButton: { backgroundColor: '#27ae60' },
  cancelButton: { backgroundColor: '#e74c3c' },
  actionButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#0a2d55', marginBottom: 12, letterSpacing: 0.3 },
  
  infoItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#D4AF37',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  infoContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoText: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#0a2d55', fontWeight: '600' },
  inputField: {
    fontSize: 14, color: '#0a2d55', fontWeight: '600',
    borderBottomWidth: 1, borderBottomColor: '#D4AF37', paddingVertical: 2,
  },

  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  menuContent: { flexDirection: 'row', alignItems: 'center' },
  menuText: { fontSize: 14, color: '#0a2d55', fontWeight: '600', marginLeft: 15 },
  
  aboutItem: {
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  aboutText: { fontSize: 14, color: '#1565c0', fontWeight: '500' },
  logoutButton: { marginTop: 10, borderRadius: 12, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  logoutGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 10 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  bottomPadding: { height: 20 },
});