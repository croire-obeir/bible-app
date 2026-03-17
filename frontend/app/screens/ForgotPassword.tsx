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
import { handleForgotPassword } from '../../api/services/userDataUpdateServices';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [emailSent, setEmailSent] = useState(''); // State pour le chargement, si nécessaire
  
  // Initialize state as an object
  const [userEmail, setUserEmail] = useState({
    email: '',
  });

  

  
  
  const onForgotPasswordPressed=async()=>{
    console.log('Email envoyé :', userEmail.email); // Debug: Affiche l'email dans la console
    const result = await handleForgotPassword(userEmail.email);

    if (result?.success) {
      setEmailSent(result.data); // Affiche le message de succès
      setUserEmail({ email: '' }); // Réinitialise le champ email
    }
    
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
              
               <CustomInput icon="mail-outline" placeholder="Adresse e-mail" 
                value={userEmail.email}
                onChangeText={(text) =>{ 
                  setUserEmail({...userEmail, email: text})
                  setEmailSent('')
                }}
                />
               { emailSent ? <Text style={{ marginTop: 20, color:'#AA8418' }}>{emailSent}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={onForgotPasswordPressed}>
              <LinearGradient colors={['#D4AF37', '#AA8418']} style={styles.gradient}>
                <Text style={styles.btnText}>ENVOYER EMAIL</Text>
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