import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type AppRoute = `/${string}`;

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      id: '1',
      title: 'Bible',
      icon: 'book-outline',
      description: 'Lire la Bible en plusieurs langues',
      color: '#D4AF37',
      route: '/Bible' as AppRoute,
    },
    {
      id: '2',
      title: 'Audios',
      icon: 'volume-high-outline',
      description: 'Accédez à des enregistrements audio',
      color: '#1565c0',
      route: '/Audios' as AppRoute,
    },
    {
      id: '3',
      title: 'Enseignements',
      icon: 'play-circle-outline',
      description: 'Regardez des enseignements vidéo',
      color: '#0a2d55',
      route: '/Enseignements' as AppRoute,
    },
    {
      id: '4',
      title: 'Documents',
      icon: 'document-text-outline',
      description: 'Plongez dans des documents inspirants',
      color: '#AA8418',
      route: '/Documents' as AppRoute,
    },
  ];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/enregistrement.png')}
        style={styles.bg}
        imageStyle={{ opacity: 0.05 }}
      >
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bienvenue</Text>
            <Text style={styles.headerSubtitle}>CROIRE & OBÉIR</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/screens/Profile' as AppRoute)}
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={32} color="#D4AF37" />
          </TouchableOpacity>
        </SafeAreaView>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section Verset du jour */}
          <LinearGradient
            colors={['#0a2d55', '#1565c0']}
            style={styles.verseCard}
          >
            <Ionicons
              name="star"
              size={24}
              color="#D4AF37"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.verseTitle}>Verset du jour</Text>
            <Text style={styles.verseText}>
              "Car Dieu a tant aimé le monde qu'il a donné son Fils unique,
              afin que quiconque croit en lui ne périsse point, mais qu'il ait
              la vie éternelle."
            </Text>
            <Text style={styles.verseReference}>Jean 3:16</Text>
          </LinearGradient>

          {/* Grille de fonctionnalités */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Explorez</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.featureCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(feature.route as AppRoute)}
                >
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: feature.color + '20' },
                    ]}
                  >
                    <Ionicons
                      name={feature.icon as any}
                      size={28}
                      color={feature.color}
                    />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Lecture */}
          <View style={styles.readingSection}>
            <View style={styles.readingHeader}>
              <Text style={styles.sectionTitle}>Continuer la lecture</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Voir tout →</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.readingCard}
              onPress={() => router.push('/Bible' as AppRoute)}
            >
              <View style={styles.readingContent}>
                <Ionicons name="book" size={24} color="#D4AF37" />
                <View style={styles.readingText}>
                  <Text style={styles.readingTitle}>Genèse 1:1-5</Text>
                  <Text style={styles.readingProgress}>Progression: 15%</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#1565c0" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#0a2d55',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  greeting: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  verseCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  verseTitle: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  verseText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 15,
  },
  verseReference: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a2d55',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  readingSection: {
    marginBottom: 20,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAll: {
    color: '#1565c0',
    fontSize: 12,
    fontWeight: '600',
  },
  readingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  readingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  readingText: {
    marginLeft: 15,
    flex: 1,
  },
  readingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 4,
  },
  readingProgress: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});