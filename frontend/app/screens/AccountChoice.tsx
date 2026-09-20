import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountChoiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.logo}>
            <Text style={styles.title}>CROIRE & OBÉIR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Comment souhaitez-vous continuer ?</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/screens/Login')}
            >
              <LinearGradient colors={['#0a2d55', '#103b92']} style={styles.gradient}>
                <Text style={styles.btnText}>Se connecter / S&apos;inscrire</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => router.replace('/screens/Home')}
            >
              <Text style={styles.guestButtonText}>Continuer en tant qu&apos;invité</Text>
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
  content: { flex: 1, paddingHorizontal: 26, backgroundColor: '#fff' },
  logo: { marginTop: 80, alignItems: 'center', marginBottom: 50 },
  title: {
    fontFamily: 'serif',
    fontStyle: 'normal',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#0a2d55',
  },
  line: { width: 40, height: 3, backgroundColor: '#AA8418', marginTop: 5 },
  card: { flex: 1 },
  heading: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#0a2d55',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: { height: 52, borderRadius: 18, overflow: 'hidden' },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  guestButton: {
    height: 52,
    borderRadius: 18,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#0a2d55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonText: { color: '#0a2d55', fontWeight: 'bold', letterSpacing: 1 },
});
