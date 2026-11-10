import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../../components/CustomHeader';
import CustomInput from '../../../components/CustomInput';
import { useTabBarScroll } from '../../../components/tab-bar-visibility';

const WHATSAPP_PHONE_NUMBER =
  process.env.EXPO_PUBLIC_WHATSAPP_NUMBER ?? '237000000000';
const CONTACT_EMAIL =
  process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? 'contact@croireobeir.org';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function openExternalUrl(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      Alert.alert(
        'Action indisponible',
        'Impossible d’ouvrir ce lien sur cet appareil.'
      );
      return;
    }

    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Erreur',
      'Une erreur est survenue lors de l’ouverture du lien.'
    );
  }
}

async function openWhatsApp(phoneNumber: string) {
  const nativeUrl = `whatsapp://send?phone=${phoneNumber}`;
  const webUrl = `https://wa.me/${phoneNumber}`;

  try {
    const canOpenNative = await Linking.canOpenURL(nativeUrl);

    if (canOpenNative) {
      await Linking.openURL(nativeUrl);
      return;
    }
  } catch {
    // Fall through to the universal wa.me link.
  }

  await openExternalUrl(webUrl);
}

export default function ContactScreen() {
  const handleTabBarScroll = useTabBarScroll();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmitForm = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Champs requis', 'Veuillez renseigner votre nom et votre adresse e-mail.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      Alert.alert('Adresse e-mail invalide', 'Veuillez entrer une adresse e-mail valide.');
      return;
    }

    const subject = encodeURIComponent(`Contact depuis l’application — ${trimmedName}`);
    const body = encodeURIComponent(
      `Nom complet : ${trimmedName}\nAdresse e-mail : ${trimmedEmail}`
    );

    void openExternalUrl(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <Header title="Contact" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleTabBarScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.pageTitle}>Nous contacter</Text>
            <Text style={styles.intro}>
              Une question, une suggestion ou besoin d’aide ? Choisissez le
              moyen qui vous convient le mieux.
            </Text>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, styles.whatsappIconWrap]}>
                  <Ionicons name="logo-whatsapp" size={26} color="#25D366" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Contactez-nous sur WhatsApp</Text>
                  <Text style={styles.cardDescription}>
                    Besoin d'une réponse rapide ? Échangez directement avec notre équipe sur WhatsApp.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.whatsappButton}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Discuter sur WhatsApp"
                onPress={() => void openWhatsApp(WHATSAPP_PHONE_NUMBER)}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Discuter sur WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <Ionicons name="mail-outline" size={22} color="#0a2d55" />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>Contactez-nous par e-mail</Text>
                  <Text style={styles.cardDescription}>
                    Vous pouvez également nous envoyer un e-mail directement.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Envoyer un e-mail"
                onPress={() => void openExternalUrl(`mailto:${CONTACT_EMAIL}`)}
              >
                <LinearGradient colors={['#0a2d55', '#103b92']} style={styles.gradient}>
                  <Ionicons name="mail-outline" size={18} color="#fff" />
                  <Text style={styles.primaryButtonText}>Envoyer un e-mail</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 160 },
  pageTitle: {
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: 28,
    lineHeight: 34,
    color: '#0a2d55',
    marginBottom: 8,
  },
  intro: {
    textAlign: 'center',
    color: '#687080',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#edf0f4',
    elevation: 1,
    shadowColor: '#a0a0a0',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  cardHeaderText: { flex: 1 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e7edf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappIconWrap: {
    backgroundColor: '#e8f8ee',
  },
  cardTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: 18,
    lineHeight: 24,
    color: '#0a2d55',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#687080',
    marginBottom: 4,
  },
  
  
  button: {
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  whatsappButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  bottomPadding: { height: 20 },
});
