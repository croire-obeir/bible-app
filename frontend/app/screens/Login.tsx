import React from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, SafeAreaView, StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    // À implémenter avec expo-auth-session et @react-native-google-signin/google-signin
    console.log('Connexion Google...');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <SafeAreaView style={styles.content}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>

          <View style={styles.logo}>
            <Text style={styles.title}>CROIRE & OBÉIR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Connexion</Text>

            <CustomInput icon="mail-outline" placeholder="Adresse e-mail" />
            <CustomInput icon="lock-closed-outline" placeholder="Mot de passe" isPassword />

            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/Home')}>
              <LinearGradient colors={['#D4AF37', '#0a2d55']} style={styles.gradient}>
                <Text style={styles.btnText}>SE CONNECTER</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bouton Google */}
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.googleButtonText}>SE CONNECTER AVEC GOOGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/screens/Register')}>
              <Text style={styles.link}>
                Pas encore de compte ? <Text style={styles.bold}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 30 },
  backButton: { marginTop: 10, color: '#1565c0', fontSize: 16, fontWeight: 'bold' },
  logo: { marginTop: 40, alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: 'bold', letterSpacing: 3, color: '#0a2d55' },
  line: { width: 40, height: 3, backgroundColor: '#AA8418', marginTop: 5 },
  card: { flex: 1 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 30 },
  forgot: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { color: '#1565c0', fontSize: 13, textDecorationLine: 'underline' },
  button: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 20 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  googleButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: '#4285F4',
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 0.5 },
  link: { marginTop: 25, textAlign: 'center', color: '#666' },
  bold: { color: '#1565c0', fontWeight: 'bold' },
});
