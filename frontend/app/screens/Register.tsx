
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('@all_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Vérifier si l'email existe déjà
      if (users.find((u: any) => u.email === email)) {
        Alert.alert("Erreur", "Cet email est déjà utilisé.");
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);

      await AsyncStorage.setItem('@all_users', JSON.stringify(users));
      
      Alert.alert("Succès", "Compte créé ! Vous pouvez vous connecter.", [
        { text: "OK", onPress: () => router.push('/screens/(tabs)/Home') }
      ]);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de créer le compte.");
    }
  };

  // Initialize state as an object
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Helper function to update specific fields
  const handleInputChange = (name: string, value: string) => {
    setUserData({
      ...userData,
      [name]: value,
    });
  }

  return (
    <View style={styles.container}>

      <ImageBackground source={require('../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>

        <SafeAreaView style={styles.content}>
          
          {/* Header avec bouton retour */}
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
            <Ionicons name="arrow-back" size={24} color="#1565c0" />
          </TouchableOpacity>

          <Text style={styles.brand}>CROIRE & OBÉIR</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.heading}>Création de Compte</Text>


            <CustomInput icon="person-outline" placeholder="Nom complet" value={name} onChangeText={setName} />
            <CustomInput icon="mail-outline" placeholder="Adresse e-mail" value={email} onChangeText={setEmail} />
            <CustomInput icon="lock-closed-outline" placeholder="Mot de passe" isPassword value={password} onChangeText={setPassword} />
            <CustomInput icon="checkmark-circle-outline" placeholder="Confirmer le mot de passe" isPassword value={confirmPassword} onChangeText={setConfirmPassword} />

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <LinearGradient colors={['#D4AF37', '#AA8418']} style={styles.gradient}>
                <Text style={styles.btnText}>CRÉER MON COMPTE</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>
                Déjà un compte ? <Text style={styles.bold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
            
            {/* Ajout d'un petit espace en bas pour le scroll */}
            <View style={{ height: 20 }} /> 

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

// ... (garder les mêmes styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  content: { flex: 1, padding: 30 },
  brand: { textAlign: 'center', marginVertical: 20, fontWeight: 'bold', letterSpacing: 2 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 30 },
  button: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 30 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 25, textAlign: 'center', color: '#666' },
  bold: { color: '#1565c0', fontWeight: 'bold' },
});