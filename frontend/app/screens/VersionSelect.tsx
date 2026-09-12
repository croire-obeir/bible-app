// app/screens/VersionSelect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VersionSelectScreen() {
  const router = useRouter();

  const versions = [
    { id: '1', name: 'Louis Segond', fullname: 'Louis Segond 1910', accent: '#f4e9c7' },
    { id: '2', name: 'La Bible Semeur', fullname: 'Bible Semeur', accent: '#dde8f5' },
  ];

  const handleSelect = (versionName: string) => {
    router.replace({
      pathname: '/screens/(tabs)/bible',
      params: { selectedVersion: versionName }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0a2d55" />
        </TouchableOpacity>

        <Text style={styles.appTitle}>Croire & Obéir</Text>

        <TouchableOpacity onPress={() => router.push('/screens/SearchByTopic')}>
          <Ionicons name="search" size={22} color="#0a2d55" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.heroContent}>
          <Text style={styles.pageTitle}>Versions</Text>
          <Text style={styles.intro}>Choisissez la version biblique que vous souhaitez lire.</Text>
        </View>

        <FlatList
          data={versions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.versionCard, { backgroundColor: item.accent }]}
              onPress={() => handleSelect(item.name)}
              activeOpacity={0.9}
            >
              <View style={styles.cardTextWrap}>
                <Text style={styles.versionName}>{item.name}</Text>
                <Text style={styles.versionFull}>{item.fullname}</Text>
              </View>

              <View style={styles.iconWrap}>
                <Ionicons name="chevron-forward" size={18} color="#0a2d55" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3e7',
  },
  appHeader: {
    height: 130,
    backgroundColor: '#f8f2e7',
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 22,
    color: '#0a2d55',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  heroContent: {
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: 'serif',
    color: '#0d254c',
    fontWeight: '700',
    fontSize: 38,
    marginBottom: 10,
  },
  intro: {
    color: '#555b68',
    fontSize: 16,
    lineHeight: 22,
  },
  listContainer: {
    paddingBottom: 30,
  },
  versionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTextWrap: {
    flex: 1,
  },
  versionName: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 4,
  },
  versionFull: {
    fontSize: 13,
    color: '#4b5563',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
