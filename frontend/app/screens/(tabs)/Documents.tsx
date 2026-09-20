import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, SafeAreaView, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AppDrawer from '../../../components/AppDrawer';
import Header from '../../../components/CustomHeader';

type PdfItem = {
  id: string;
  title: string;
  description?: string;
  url: string;
};

export default function DocumentsScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const pdfs: PdfItem[] = useMemo(
    () => [
      {
        id: 'pdf-1',
        title: 'Document PDF de test',
        description: 'Lecture temporaire (sera remplacé par le backend).',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'pdf-2',
        title: 'PDF - Spécification (exemple)',
        description: 'Un autre PDF de démonstration.',
        url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
      },
    ],
    []
  );

  const openPdf = useCallback(async (item: PdfItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'ouvrir le PDF.");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../../../assets/enregistrement.png')} style={styles.bg} imageStyle={{ opacity: 0.05 }}>
        {/* <SafeAreaView style={styles.header}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}><Ionicons name="menu" size={20} color="#0a2d55" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Croire & Obéir</Text>
          <Ionicons name="search" size={19} color="#0a2d55" />
        </SafeAreaView> */}
        <Header
          title="Documents"
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Bibliothèque de{`\n`}Documents</Text>
          <Text style={styles.intro}>Explorez notre collection de ressources, études et ouvrages pour approfondir votre foi.</Text>
          <View style={styles.searchBox}><Ionicons name="search" size={15} color="#8a99ad" /><TextInput placeholder="Rechercher un document, auteur..." placeholderTextColor="#9aa3b3" style={styles.searchInput} /></View>
          <View style={styles.filters}>{['Tout', 'Études Bibliques', 'Livres'].map((filter, index) => <View key={filter} style={[styles.filter, index === 0 && styles.activeFilter]}><Text style={[styles.filterText, index === 0 && styles.activeFilterText]}>{filter}</Text></View>)}</View>

          {pdfs.map((p) => (
            <TouchableOpacity key={p.id} style={styles.itemCard} activeOpacity={0.85} onPress={() => openPdf(p)}>
              <View style={styles.left}>
                <View style={styles.iconWrap}>
                  <Ionicons name="document-text-outline" size={22} color="#AA8418" />
                </View>
                <View style={styles.textWrap}><Text style={styles.category}>{p.id === 'pdf-1' ? 'ÉTUDES BIBLIQUES' : 'LIVRES'}</Text>
                  <Text style={styles.itemTitle}>{p.title}</Text>
                  <Text style={styles.itemMeta} numberOfLines={2}>
                    {p.description ?? ''}
                  </Text>
                </View>
              </View>
              <View style={styles.cardArrow}><Ionicons name="chevron-forward" size={15} color="#8da0ba" /></View>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
      <AppDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bg: { flex: 1 },
  header: { height: 100, backgroundColor: '#c7ba9d', paddingHorizontal: 14, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, headerTitle: { color: '#233A59', fontFamily: 'serif', fontStyle: 'normal', fontSize: 25, fontWeight: '700' }, scrollContent: { paddingHorizontal: 12, paddingTop: 13, paddingBottom: 160 }, pageTitle: { textAlign: 'center', fontFamily: 'serif', fontSize: 30, lineHeight: 36, color: '#0a2d55', marginTop: 18, marginBottom: 10 }, intro: { textAlign: 'center', color: '#687080', fontSize: 13, lineHeight: 19, marginBottom: 16 }, searchBox: { height: 46, borderRadius: 23, backgroundColor: '#e9e9ea', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 }, searchInput: { flex: 1, fontSize: 13 }, filters: { flexDirection: 'row', gap: 9, paddingVertical: 15 }, filter: { paddingHorizontal: 17, height: 32, borderRadius: 16, justifyContent: 'center', backgroundColor: '#e5e5e6' }, activeFilter: { backgroundColor: '#092d6b' }, filterText: { fontSize: 11, color: '#666b76' }, activeFilterText: { color: '#fff' },
  itemCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#edf0f4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 }, left: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1, paddingRight: 8 }, iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e7edf7', justifyContent: 'center', alignItems: 'center' }, textWrap: { flex: 1 }, category: { color: '#9c7a1a', fontSize: 10, fontWeight: '700', marginBottom: 5 }, itemTitle: { fontFamily: 'serif', fontSize: 17, lineHeight: 23, color: '#0a2d55' }, itemMeta: { marginTop: 7, fontSize: 12, color: '#777', lineHeight: 18 }, cardArrow: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#f0f3f7', alignItems: 'center', justifyContent: 'center' }, bottomPadding: { height: 20 },
});
