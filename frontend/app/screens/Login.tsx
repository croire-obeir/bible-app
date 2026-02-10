import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleUserSignIn, sendGoogleTokenToBackend } from '@/api/services/authServices';
//Google login
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// This is required to make sure the popup closes correctly on web
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
   // Initialize state as an object
  const [userLoginData, setUserLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async () => {
    // if (!email || !password) {
    //   Alert.alert("Erreur", "Veuillez remplir tous les champs.");
    //   return;
    // }

    try {
      const storedUsers = await AsyncStorage.getItem('@all_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      // Vérification de l'utilisateur
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (user) {
        // On stocke l'utilisateur actuellement connecté
        await AsyncStorage.setItem('@current_user', JSON.stringify(user));
        // On synchronise aussi avec la clé profile pour ton écran profil
        await AsyncStorage.setItem('@user_profile_data', JSON.stringify({
          name: user.name,
          email: user.email,
          avatar: null
        }));
        
        router.push('/screens/(tabs)/Home');
      } else {
        Alert.alert("Échec", "Email ou mot de passe incorrect.");
      }
    } catch (e) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la connexion.");
    }
  };

    const handleInputChange = (name: string, value: string) => {
      
      setUserLoginData({
        ...userLoginData,
        [name]: value,
      });
    }


    const onLoginPressed=async()=>{
        const result = await handleUserSignIn(userLoginData);
    
        if (result?.success) {
          router.push('/screens/Home');
        }
      }


    const [request, response, promptAsync] = Google.useAuthRequest({
    // androidClientId: "73677966494-a556nbq4q8e81g55t95edkubqph5bceq.apps.googleusercontent.com",
    // iosClientId: "73677966494-u7vr5o6oqs2ga6ukt4vakr7i077klr80.apps.googleusercontent.com",
    webClientId: "73677966494-5g1uaag0q1d15u0ki10k8an4ptehe9tq.apps.googleusercontent.com",
    responseType: "id_token",// change this later for prod and to implement refresh tokens
    redirectUri: Platform.select({
      web: 'http://localhost:8081', // Replace with your app's scheme
      }),
    });



    const getApiUrl = () => {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    } else {
      // iOS Simulator or Physical Device
      return 'http://192.168.1.XX:3000'; // Replace with your IP
    }
  };



  
const onGoggleLoginPressed=async(idToken:string)=>{
     const result = await sendGoogleTokenToBackend(idToken);
        if (result?.success) {
          router.push('/screens/Home');
        }
      }

  useEffect(() => {
    if (response?.type === 'success') {
     onGoggleLoginPressed(response.params.id_token)
    }
  }, [response]);

  

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
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

            <CustomInput icon="mail-outline" placeholder="Adresse e-mail" 
            value={userLoginData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            />
            <CustomInput icon="lock-closed-outline" placeholder="Mot de passe" isPassword 
            value={userLoginData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            />
            <TouchableOpacity style={styles.forgot}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onLoginPressed}>
              <LinearGradient colors={['#D4AF37', '#0a2d55']} style={styles.gradient}>
                <Text style={styles.btnText}>SE CONNECTER</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton} disabled={!request} onPress={() => promptAsync()}>
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

// ... (garder les mêmes styles que ton code original)
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
    height: 55, borderRadius: 15, backgroundColor: '#4285F4', marginTop: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  googleButtonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 0.5 },
  link: { marginTop: 25, textAlign: 'center', color: '#666' },
  bold: { color: '#1565c0', fontWeight: 'bold' },
});