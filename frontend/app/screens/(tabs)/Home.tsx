import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppDrawer from '../../../components/AppDrawer';

type AppRoute =
  | '/screens/VersionSelect'
  | '/screens/(tabs)/Audios'
  | '/screens/(tabs)/Videos'
  | '/screens/(tabs)/Documents';

export default function HomeScreen() {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const features: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    route: AppRoute;
    backgroundColor: string;
    iconBackground: string;
    iconColor: string;
    titleColor: string;
  }> = [
    {
      id: '1',
      title: 'La Bible',
      subtitle: '',
      icon: 'book',
      route: '/screens/VersionSelect',
      backgroundColor: '#EDE8D3',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '2',
      title: 'Enseignements\nAudio',
      subtitle: '',
      icon: 'headset',
      route: '/screens/(tabs)/Audios',
      backgroundColor: '#B7B190',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '3',
      title: 'Vidéos\nSacrées',
      subtitle: '',
      icon: 'play-circle',
      route: '/screens/(tabs)/Videos',
      backgroundColor: '#B7B190',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
    {
      id: '4',
      title: 'Documents',
      subtitle: '',
      icon: 'folder-open-outline',
      route: '/screens/(tabs)/Documents',
      backgroundColor: '#EDE8D3',
      iconBackground: '#FFFFFF',
      iconColor: '#0A2D55',
      titleColor: '#0A2D55',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8F3E7"
        translucent={false}
      />

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => setDrawerVisible(true)}
        >
          <Ionicons
            name="menu"
            size={21}
            color="#0A2D55"
          />
        </TouchableOpacity>

        <Text style={styles.logo}>
          Croire & Obéir
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => router.push('/screens/SearchByTopic')}
        >
          <Ionicons
            name="search"
            size={21}
            color="#0A2D55"
          />
        </TouchableOpacity>
      </View>

      {/* ==================================================
          CONTENU
      ================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >

        {/* ==================================================
            VERSET DU JOUR
        ================================================== */}

        <TouchableOpacity
          activeOpacity={0.95}
          style={styles.verseCard}
        >
          <ImageBackground
            source={require('../../../assets/bible.jpg')}
            resizeMode="cover"
            style={styles.verseBackground}
            imageStyle={styles.verseImage}
          >
            <LinearGradient
              colors={[
                'rgba(10, 45, 85, 0.30)',
                'rgba(10, 45, 85, 0.60)',
                'rgba(10, 45, 85, 0.95)',
              ]}
              locations={[0, 0.48, 1]}
              style={styles.verseGradient}
            >
              <View style={styles.verseContent}>

                <View style={styles.verseLabelRow}>
                  <Ionicons name="star" size={8} color="#D4AF37" />
                  <Text style={styles.verseLabel}>VERSET DU JOUR</Text>
                </View>

                <Text style={styles.verseText}>
                  “Que ce livre de la loi ne déloigne point de ta bouche; médite-le jour et nuit...”
                </Text>

                <Text style={styles.verseReference}>
                  Josué 1:8 →
                </Text>

              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* ==================================================
            GRILLE DES 4 CARTES
        ================================================== */}

        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              activeOpacity={0.82}
              style={[
                styles.featureCard,
                {
                  backgroundColor: feature.backgroundColor,
                },
              ]}
              onPress={() => router.push(feature.route)}
            >
              <View
                style={[
                  styles.featureIcon,
                  {
                    backgroundColor: feature.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={18}
                  color={feature.iconColor}
                />
              </View>

              <Text style={[styles.featureTitle, { color: feature.titleColor }]}>
                {feature.title}
              </Text>

            </TouchableOpacity>
          ))}
        </View>

        {/* Petit espace avant la tabBar native */}
        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* ==================================================
          DRAWER
          IMPORTANT :
          aucune bottom navigation ici.
          Expo Router gère la tabBar.
      ================================================== */}

      <AppDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // ======================================================
  // HEADER
  // ======================================================

  header: {
    height: 100,
    width: '100%',
    backgroundColor: '#c7ba9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 25,
    fontWeight: '400',
    color: '#233A59',
    marginTop: 1,
  },

  // ======================================================
  // SCROLL
  // ======================================================

  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 13,
    paddingBottom: 0,
  },

  // ======================================================
  // VERSET
  // ======================================================

  verseCard: {
    width: '100%',
    height: 350,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 23,
    marginTop: 10,
  },

  verseBackground: {
    width: '100%',
    height: '100%',
  },

  verseImage: {
    borderRadius: 24,
  },

  verseGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  verseContent: {
    paddingHorizontal: 21,
    paddingBottom: 20,
  },

  verseLabel: {
    color: '#D4AF37',
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
  },
  verseLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },

  verseText: {
    color: '#FFFFFF',
    fontFamily: 'serif',
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    marginBottom: 12,
  },

  verseReference: {
    color: '#D4AF37',
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '600',
  },

  // ======================================================
  // CARTES
  // ======================================================

  featuresGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  featureCard: {
    width: '48.4%',
    height: 160,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingTop: 13,
    marginBottom: 10,
  },

  featureIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  featureTitle: {
    color: '#173456',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

  featureSubtitle: {
    color: '#173456',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  bottomSpace: {
    height: 10,
  },
});
