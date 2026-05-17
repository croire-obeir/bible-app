// app/screens/VersionSelect.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VersionSelectScreen() {
  const router = useRouter();

  const versions = [
    { id: '1', name: 'LSG 1910', fullname: 'Louis Segond 1910' },
    { id: '2', name: 'Parole Vivante', fullname: 'La Bible Parole Vivante' },
  ];

  const handleSelect = (versionName: string) => {
    // Navigate back to the bible screen while passing the selected version as a query parameter
    router.replace({
      pathname: '/screens/(tabs)/bible',
      params: { selectedVersion: versionName }
    });
  };

  return (
    <View style={styles.container}>
      {/* Custom Close / Back Row */}
      <View style={styles.topRow}>
        <Text style={styles.titleText}>Sélectionner une version</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={26} color="#0a2d55" />
        </TouchableOpacity>
      </View>

      {/* Version List */}
      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.versionCard} 
            onPress={() => handleSelect(item.name)}
          >
            <View>
              <Text style={styles.versionName}>{item.name}</Text>
              <Text style={styles.versionFull}>{item.fullname}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50, // Pushes text down past device status bars safely
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0a2d55',
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  versionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  versionName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a2d55',
    marginBottom: 2,
  },
  versionFull: {
    fontSize: 13,
    color: '#666',
  },
});