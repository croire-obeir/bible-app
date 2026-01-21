import React, { useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    subtitle: 'La Parole vivante,\noù que vous soyez.',
    description: 'Une expérience immersive pour nourrir votre foi quotidiennement.',
    image: require('../../assets/bible.cross_.webp'),
  },
  {
    id: '2',
    subtitle: 'Multiples versions\nde la Bible',
    description: 'Accédez facilement à différentes traductions pour approfondir votre étude.',
    image: require('../../assets/Timage.jpg'),
  },
  {
    id: '3',
    subtitle: 'Enseignements\nMultimédias',
    description: 'Des milliers d\'audios et vidéos pour éclairer votre chemin spirituel.',
    image: require('../../assets/pimage.jpg'),
    isLast: true,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const handleNext = (index: number) => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToOffset({
        offset: (index + 1) * width,
        animated: true,
      });
    }
  };

  const handleStart = () => {
    router.push('/screens/Login');
  };

  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.paginationDot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Titre Fixe en Haut */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>CROIRE & OBÉIR</Text>
        <View style={styles.headerLine} />
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.slide}>
              {/* Image avec Overlay sombre progressif */}
              <ImageBackground source={item.image} style={styles.image} resizeMode="cover">
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
                  style={styles.gradient}
                />
              </ImageBackground>

              {/* Contenu textuel */}
              <View style={styles.footer}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.description}>{item.description}</Text>

                <View style={styles.actionContainer}>
                  {item.isLast ? (
                    <TouchableOpacity style={styles.mainButton} onPress={handleStart} activeOpacity={0.9}>
                      <LinearGradient
                        colors={['#D4AF37', '#AA8418']} // Couleur Or/Premium
                        style={styles.gradientButton}
                      >
                        <Text style={styles.buttonText}>COMMENCER L'AVENTURE</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                        style={styles.nextButton} 
                        onPress={() => handleNext(index)}
                    >
                      <Ionicons name="arrow-forward" size={24} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
      {renderPaginationDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  headerTitle: {
    color: '#D4AF37', // Or
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerLine: {
    width: 30,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 8,
  },
  slide: {
    width,
    height,
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  footer: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 15,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  actionContainer: {
    marginTop: 40,
    height: 60,
    justifyContent: 'center',
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainButton: {
    width: width * 0.8,
    height: 55,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignSelf: 'center',
  },
  paginationDot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    marginHorizontal: 4,
  },
});