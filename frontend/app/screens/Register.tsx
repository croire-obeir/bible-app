import  {useState} from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';

export default function RegisterScreen() {
  const router = useRouter();

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

  console.log(userData)
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1565c0" />
        </TouchableOpacity>

        <Text style={styles.brand}>CROIRE & OBÉIR</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Création de Compte</Text>

          <CustomInput 
          icon="person-outline" 
          placeholder="Nom complet" 
          value={userData.fullName}
          onChangeText={(text) => handleInputChange('fullName', text)}
          />
          <CustomInput icon="mail-outline" placeholder="Adresse e-mail" 
           value={userData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          />
          <CustomInput icon="lock-closed-outline" placeholder="Mot de passe" isPassword 
           value={userData.password}
          onChangeText={(text) => handleInputChange('password', text)}
          />
          <CustomInput icon="checkmark-circle-outline" placeholder="Confirmer le mot de passe" isPassword 
           value={userData.confirmPassword}
          onChangeText={(text) => handleInputChange('confirmPassword', text)}/>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/Home')}>
            <LinearGradient colors={['#D4AF37', '#AA8418']} style={styles.gradient}>
              <Text style={styles.btnText}>CRÉER MON COMPTE</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>
              Déjà un compte ? <Text style={styles.bold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 30 },
  brand: { textAlign: 'center', marginVertical: 20, fontWeight: 'bold', letterSpacing: 2 },
  heading: { fontSize: 26, fontWeight: '800', marginBottom: 30 },
  button: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 30 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 25, textAlign: 'center', color: '#666' },
  bold: { color: '#1565c0', fontWeight: 'bold' },
});
