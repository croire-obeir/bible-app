import React, { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { SacredPage } from '@/components/sacred/SacredPage';
import { sacredColors } from '@/constants/sacredTheme';

type PdfItem = {
  id: string;
  title: string;
  description: string;
  url: string;
};

export default function DocumentsScreen() {
  const documents: PdfItem[] = useMemo(
    () => [
      {
        id: 'pdf-1',
        title: 'Carnet de méditation',
        description: 'Notes, lectures et pistes de prière.',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        id: 'pdf-2',
        title: 'Étude biblique',
        description: 'Support de lecture pour petits groupes.',
        url: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf',
      },
    ],
    []
  );

  const openPdf = useCallback(async (item: PdfItem) => {
    try {
      await WebBrowser.openBrowserAsync(item.url);
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir le PDF.");
    }
  }, []);

  return (
    <SacredPage activeTab="library">
      <Text style={styles.title}>Documents</Text>
      <Text style={styles.subtitle}>Ressources à lire et garder près de soi.</Text>

      {documents.map((document) => (
        <TouchableOpacity
          key={document.id}
          activeOpacity={0.86}
          onPress={() => openPdf(document)}
          style={styles.documentCard}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="folder-open-outline" size={24} color={sacredColors.navy} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.documentTitle}>{document.title}</Text>
            <Text style={styles.documentDescription} numberOfLines={2}>
              {document.description}
            </Text>
          </View>
          <Ionicons name="open-outline" size={22} color={sacredColors.gold} />
        </TouchableOpacity>
      ))}
    </SacredPage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 29,
    fontStyle: 'italic',
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5A6378',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  documentCard: {
    minHeight: 92,
    backgroundColor: sacredColors.cream,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: sacredColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  documentTitle: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '800',
  },
  documentDescription: {
    color: '#6F7788',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 4,
  },
});
