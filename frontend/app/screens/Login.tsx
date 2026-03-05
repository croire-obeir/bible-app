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
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

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

    
  const handlegoogleSignin = async () => {
    try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    
    // If we reach here, the pop-up worked!
    const idToken = response.data?.idToken;
    Alert.alert("Success!", "Google pop-up worked and we got a token.");
    
    if (idToken) {
      onGoggleLoginPressed(idToken); // Skip backend for now
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert("Cancelled", "You closed the pop-up.");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert("In Progress", "Google is already trying to sign you in.");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      Alert.alert("Error", "Play Services not available.");
    } else {
      // THIS IS THE MOST IMPORTANT ALERT
      Alert.alert("Google Error", `Code: ${error.code}\nMessage: ${error.message}`);
      console.log("Full error object:", JSON.stringify(error));
    }
  }
  };

    
const onGoggleLoginPressed=async(idToken:string)=>{
     const result = await sendGoogleTokenToBackend(idToken);
        if (result?.success) {
          router.push('/screens/Home');
        }
      }


  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_ID, 
      offlineAccess: true, 
      });
    }, []);



     // const [request, response, promptAsync] = Google.useAuthRequest({
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_ID,
    // iosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_ID,
    // webClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_ID,
    // responseType: "id_token",// change this later for prod and to implement refresh tokens
    // redirectUri: makeRedirectUri({
    //   scheme: 'croire-et-obeir', // Must match 'scheme' in your app.json   
    //   // preferLocalhost: true,  
    // }),
    // });

    // useEffect(() => {
  //   if (response?.type === 'success') {
  //    onGoggleLoginPressed(response.params.id_token)
  //   }
  // }, [response]);

    
    useEffect(() => {
      const checkExistingUser = async () => {
        try {
          const savedProfile = await AsyncStorage.getItem('userprofile');
          
          if (savedProfile !== null) {
            // 1. Convert string back to object
            const parsedData = JSON.parse(savedProfile);
            
            // 2. Update state while preserving other fields (like password)
            setUserLoginData(prevState => ({
              ...prevState,
              email: parsedData.email // assuming your stored object has an 'email' key
            }));
           
          }
        } catch (error) {
          console.error("Failed to load profile from storage", error);
        }
        };

      checkExistingUser();
    
    },[]);

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
            <TouchableOpacity style={styles.forgot} onPress={() => router.push('/screens/ForgotPassword')}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onLoginPressed}>
              <LinearGradient colors={['#D4AF37', '#0a2d55']} style={styles.gradient}>
                <Text style={styles.btnText}>SE CONNECTER</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleButton}  onPress={() => handlegoogleSignin()}>
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.googleButtonText}>SE CONNECTER AVEC GOOGLE </Text>
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