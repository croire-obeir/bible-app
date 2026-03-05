import  {useState} from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  ImageBackground,
  SafeAreaView
} from 'react-native';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../../components/CustomInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  // Initialize state as an object
  const [userPassword, setUserPassword] = useState({
    password: '',
    confirmPassword: '',
  });

  const [passwordsMatch, setPasswordsMatch]=useState(true);

  // Helper function to update specific fields
  const handleInputChange = (name: string, value: string) => {
    if (name==="confirmPassword" && value!==userPassword.password)setPasswordsMatch(false);
    if (name==="confirmPassword" && value===userPassword.password)setPasswordsMatch(true);
    setUserPassword({
      ...userPassword,
      [name]: value,
    });
  }
  
  const onForgotPasswordPressed=async()=>{
    // const result = await handleUserRegistration(userPassword);

    // if (result?.success) {
    //   router.push('/screens/Login');
    // }
    console.log("Mot de passe à changer :", userPassword);
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
            <Text style={styles.heading}>Changement de mot de passe</Text>
              <CustomInput icon="lock-closed-outline" placeholder="Mot de passe" isPassword 
              value={userPassword.password}
              onChangeText={(text) => handleInputChange('password', text)}
              />
              {!passwordsMatch &&  (
                <Text style={{ color: 'red', marginTop: 5 }}>
                  Les mots de passe ne correspondent pas
                </Text>
              )}
              <CustomInput icon="checkmark-circle-outline" placeholder="Confirmer le mot de passe" isPassword 
              value={userPassword.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}/>


            <TouchableOpacity style={styles.button} onPress={onForgotPasswordPressed}>
              <LinearGradient colors={['#D4AF37', '#AA8418']} style={styles.gradient}>
                <Text style={styles.btnText}>CHANGER MON MOT DE PASSE</Text>
              </LinearGradient>
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