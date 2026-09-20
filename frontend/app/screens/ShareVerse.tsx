import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

type SelectedVerse = { text: string; reference: string };

const backgrounds = [
  require('../../assets/bible.jpg'),
  require('../../assets/pimage.jpg'),
  require('../../assets/Timage.jpg'),
];

export default function ShareVerseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    verseText?: string;
    reference?: string;
    selectedVerses?: string;
  }>();
  const [background, setBackground] = useState<number | null>(0);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [pendingBackground, setPendingBackground] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const cardRef = useRef<View>(null);

  const selectedVerses = useMemo<SelectedVerse[]>(() => {
    if (params.selectedVerses) {
      try {
        const parsedVerses = JSON.parse(params.selectedVerses);
        if (Array.isArray(parsedVerses) && parsedVerses.length > 0) return parsedVerses;
      } catch {
        // Keep the single-verse fallback for older links.
      }
    }
    return [{
      text: params.verseText || 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.',
      reference: params.reference || 'Jeremiah 29:11',
    }];
  }, [params.reference, params.selectedVerses, params.verseText]);

  const fullText = selectedVerses.map((verse) => `“${verse.text}” — ${verse.reference}`).join('\n\n');

  const selectImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Accès requis', 'Autorisez l’accès à vos photos pour ajouter une image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled) {
      setPendingBackground(result.assets[0].uri);
    }
  };

  const confirmCustomBackground = () => {
    if (!pendingBackground) return;
    setCustomBackground(pendingBackground);
    setBackground(null);
    setPendingBackground(null);
  };

  const copyText = async () => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(fullText);
      Alert.alert('Texte copié', 'Les versets sélectionnés sont dans le presse-papiers.');
    } catch {
      Alert.alert(
        'Copie indisponible',
        'Reconstruisez l’application native pour activer la copie. Vous pouvez partager le texte directement.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Partager', onPress: shareText },
        ],
      );
    }
  };

  const shareText = async () => {
    await Share.share({ message: fullText });
  };

  const shareImage = async () => {
    if (!cardRef.current) return;

    try {
      // These modules are loaded only when sharing an image. This keeps an
      // older development build from crashing before it has been rebuilt.
      const Sharing = await import('expo-sharing');
      const { captureRef } = await import('react-native-view-shot');
      if (!await Sharing.isAvailableAsync()) {
        Alert.alert('Partage indisponible', 'Le partage d’images n’est pas disponible sur cet appareil.');
        return;
      }

      const imageUri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Partager le verset sous forme d’image',
      });
    } catch (error) {
      console.error('Unable to share verse image:', error);
      Alert.alert(
        'Mise à jour requise',
        'Reconstruisez l’application native pour activer le partage d’images.',
      );
    }
  };

  const selectedBackground = customBackground || (background !== null ? backgrounds[background] : backgrounds[0]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerAction} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#0a2d55" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerEyebrow}>PARTAGE</Text>
          <Text style={styles.headerTitle}>Écritures Sacrées</Text>
        </View>
        <TouchableOpacity style={styles.headerAction} onPress={shareText}>
          <Ionicons name="share-outline" size={21} color="#0a2d55" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>APERÇU DE L&apos;IMAGE</Text>
        <View ref={cardRef} collapsable={false}>
        <ImageBackground source={selectedBackground} style={styles.verseCard} imageStyle={styles.verseImage}>
          <LinearGradient colors={['rgba(117,82,28,.18)', 'rgba(4,39,69,.96)']} style={styles.overlay}>
            <Text style={[styles.verse, alignment === 'left' && styles.left, alignment === 'right' && styles.right]}>
              {selectedVerses.map((verse) => `“${verse.text}”`).join('\n\n')}
            </Text>
            <Text style={styles.reference}>{selectedVerses.map((verse) => verse.reference).join('  •  ').toUpperCase()}</Text>
          </LinearGradient>
        </ImageBackground>
        </View>

        <View style={styles.selectedSummary}>
          <View>
            <Text style={styles.summaryLabel}>VERSETS SÉLECTIONNÉS</Text>
            <Text style={styles.summaryText}>{selectedVerses.map((verse) => verse.reference).join(', ')}</Text>
          </View>
          <View style={styles.countBadge}><Text style={styles.countText}>{selectedVerses.length}</Text></View>
        </View>

        <View style={styles.controls}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>IMAGE DE FOND</Text>
            <TouchableOpacity onPress={selectImage} style={styles.addImageLabel}>
              <Ionicons name="images-outline" size={15} color="#7b6325" />
              <Text style={styles.addImageText}>Ouvrir la galerie</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.backgrounds}>
            {backgrounds.map((source, index) => (
              <TouchableOpacity key={index} onPress={() => { setBackground(index); setCustomBackground(null); setPendingBackground(null); }} style={[styles.backgroundChoice, background === index && !customBackground && styles.selected]}>
                <Image source={source} style={styles.backgroundImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.addChoice, customBackground && styles.selected]} onPress={selectImage} accessibilityLabel="Ajouter votre propre image">
              {customBackground ? <Image source={{ uri: customBackground }} style={styles.backgroundImage} resizeMode="cover" /> : <Ionicons name="add" size={23} color="#6b7280" />}
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <View>
              <Text style={styles.controlLabel}>ALIGNEMENT</Text>
              <View style={styles.optionButtons}>
                {(['left', 'center', 'right'] as const).map((option) => (
                  <TouchableOpacity key={option} style={[styles.option, alignment === option && styles.activeOption]} onPress={() => setAlignment(option)}>
                    <Ionicons name={option === 'center' ? 'menu-outline' : 'reorder-three-outline'} size={19} color={alignment === option ? '#0a2d55' : '#333'} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryAction} onPress={copyText}>
            <Ionicons name="copy-outline" size={17} color="#0a2d55" />
            <Text style={styles.secondaryActionText}>Copier le texte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryAction} onPress={shareText}>
            <Ionicons name="share-social-outline" size={17} color="#0a2d55" />
            <Text style={styles.secondaryActionText}>Partager le texte</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={shareImage}>
          <Ionicons name="image-outline" size={17} color="#fff" />
          <Text style={styles.shareText}>Partager sous forme d&apos;image</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={pendingBackground !== null} transparent animationType="fade" onRequestClose={() => setPendingBackground(null)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Utiliser cette image ?</Text>
            {pendingBackground && <Image source={{ uri: pendingBackground }} style={styles.confirmImage} resizeMode="cover" />}
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setPendingBackground(null)}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmCustomBackground}><Text style={styles.confirmButtonText}>Utiliser l’image</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7f3' },
  header: { height: 100, backgroundColor: '#c7ba9d', paddingHorizontal: 14, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerAction: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerEyebrow: { color: '#6f6248', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textAlign: 'center' },
  headerTitle: { color: '#233A59', fontFamily: 'serif', fontStyle: 'normal', fontSize: 24, fontWeight: '700' },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 32 },
  sectionLabel: { color: '#7c8492', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 },
  verseCard: { height: 300, borderRadius: 22, overflow: 'hidden' },
  verseImage: { borderRadius: 22 },
  overlay: { flex: 1, paddingHorizontal: 22, paddingBottom: 20, justifyContent: 'flex-end' },
  verse: { color: '#fff', fontFamily: 'serif', fontSize: 20, lineHeight: 26, textAlign: 'center' },
  left: { textAlign: 'left' },
  right: { textAlign: 'right' },
  reference: { color: '#ebde51', fontSize: 9, letterSpacing: 1, fontWeight: '800', textAlign: 'center', marginTop: 18 },
  selectedSummary: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: '#a1843c', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  summaryText: { color: '#263b58', fontSize: 13, fontWeight: '600' },
  countBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0a2d55', alignItems: 'center', justifyContent: 'center' },
  countText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  controls: { marginTop: 12, borderRadius: 12, backgroundColor: '#fff', padding: 14, shadowColor: '#b6bac6', shadowOpacity: .10, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  controlHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlLabel: { color: '#8c92a1', fontSize: 10, fontWeight: '700', letterSpacing: .6, marginBottom: 9 },
  addImageLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 9 },
  addImageText: { color: '#7b6325', fontSize: 11, fontWeight: '700' },
  backgrounds: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backgroundChoice: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#e8ebef' },
  selected: { borderWidth: 2, borderColor: '#103b92' },
  backgroundImage: { width: '100%', height: '100%', borderRadius: 24 },
  addChoice: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#d8dbe0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  optionsRow: { marginTop: 14 },
  optionButtons: { flexDirection: 'row', gap: 7 },
  option: { width: 48, height: 36, borderRadius: 8, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center' },
  activeOption: { backgroundColor: '#e4ebf3', borderWidth: 1, borderColor: '#a9bad0' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryAction: { flex: 1, minHeight: 44, borderRadius: 11, backgroundColor: '#eaf0f5', alignItems: 'center', justifyContent: 'center', gap: 5, flexDirection: 'row' },
  secondaryActionText: { color: '#0a2d55', fontSize: 11, fontWeight: '700' },
  shareButton: { alignSelf: 'stretch', marginTop: 10, height: 48, borderRadius: 12, backgroundColor: '#103b92', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 3 },
  shareText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(10, 45, 85, .55)', justifyContent: 'center', padding: 24 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18 },
  confirmTitle: { color: '#0a2d55', fontFamily: 'serif', fontSize: 21, fontWeight: '700', marginBottom: 14 },
  confirmImage: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#e8ebef' },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelButton: { flex: 1, height: 44, borderRadius: 10, backgroundColor: '#eef2f5', alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: '#0a2d55', fontSize: 12, fontWeight: '700' },
  confirmButton: { flex: 1.4, height: 44, borderRadius: 10, backgroundColor: '#103b92', alignItems: 'center', justifyContent: 'center' },
  confirmButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
