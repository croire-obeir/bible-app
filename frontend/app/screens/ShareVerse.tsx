import React, { useState } from 'react';
import { ImageBackground, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const backgrounds = [
  require('../../assets/bible.jpg'),
  require('../../assets/pimage.jpg'),
  require('../../assets/Timage.jpg'),
];

export default function ShareVerseScreen() {
  const router = useRouter();
  const [background, setBackground] = useState(0);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');

  const shareVerse = async () => {
    await Share.share({ message: '“For I know the plans I have for you,” declares the LORD. — Jeremiah 29:11' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={22} color="#0a2d55" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Sacred Scripture</Text>
        <Ionicons name="ellipsis-vertical" size={20} color="#0a2d55" />
      </View>
      <View style={styles.content}>
        <ImageBackground source={backgrounds[background]} style={styles.verseCard} imageStyle={styles.verseImage}>
          <LinearGradient colors={['rgba(117,82,28,.30)', 'rgba(4,39,69,.97)']} style={styles.overlay}>
            <Text style={[styles.verse, alignment === 'left' && styles.left, alignment === 'right' && styles.right]}>“For I know the plans I{`\n`}have for you,” declares{`\n`}the LORD, “plans to{`\n`}prosper you and not to{`\n`}harm you, plans to give{`\n`}you hope and a future.”</Text>
            <Text style={styles.reference}>JEREMIAH 29:11</Text>
          </LinearGradient>
        </ImageBackground>
        <View style={styles.controls}>
          <Text style={styles.controlLabel}>BACKGROUND</Text>
          <View style={styles.backgrounds}>{backgrounds.map((source, index) => <TouchableOpacity key={index} onPress={() => setBackground(index)} style={[styles.backgroundChoice, background === index && styles.selected]}><ImageBackground source={source} style={styles.backgroundImage} imageStyle={styles.backgroundImageRadius} /></TouchableOpacity>)}<View style={styles.solidChoice} /><TouchableOpacity style={styles.addChoice}><Ionicons name="add" size={20} color="#6b7280" /></TouchableOpacity></View>
          <View style={styles.optionsRow}><View><Text style={styles.controlLabel}>TYPOGRAPHY</Text><View style={styles.optionButtons}><View style={styles.option}><Text style={styles.serif}>A</Text></View><View style={styles.option}><Text style={styles.sans}>A</Text></View></View></View><View><Text style={styles.controlLabel}>ALIGNMENT</Text><View style={styles.optionButtons}><TouchableOpacity style={styles.option} onPress={() => setAlignment('left')}><Ionicons name="reorder-three-outline" size={19} color={alignment === 'left' ? '#0a2d55' : '#333'} /></TouchableOpacity><TouchableOpacity style={styles.option} onPress={() => setAlignment('center')}><Ionicons name="reorder-three-outline" size={19} color={alignment === 'center' ? '#0a2d55' : '#333'} /></TouchableOpacity><TouchableOpacity style={styles.option} onPress={() => setAlignment('right')}><Ionicons name="reorder-three-outline" size={19} color={alignment === 'right' ? '#0a2d55' : '#333'} /></TouchableOpacity></View></View></View>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={shareVerse}><Ionicons name="share-outline" size={15} color="#fff" /><Text style={styles.shareText}>SHARE VERSE</Text></TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <View style={styles.navItem}><Ionicons name="book-outline" size={18} color="#0a2d55" /><Text style={styles.activeNavText}>HOME</Text><View style={styles.navDot} /></View>
        <View style={styles.navItem}><Ionicons name="book-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>BIBLE</Text></View>
        <View style={styles.navItem}><Ionicons name="library-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>LIBRARY</Text></View>
        <View style={styles.navItem}><Ionicons name="person-outline" size={18} color="#8da0ba" /><Text style={styles.navText}>PROFILE</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { height: 54, backgroundColor: '#cdd073', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#0a2d55', fontFamily: 'serif', fontStyle: 'italic', fontSize: 14 },
  content: { padding: 17, paddingBottom: 78 },
  verseCard: { height: 299, borderRadius: 8, overflow: 'hidden' }, verseImage: { borderRadius: 8 }, overlay: { flex: 1, paddingHorizontal: 17, paddingBottom: 58, justifyContent: 'flex-end' },
  verse: { color: '#fff', fontFamily: 'serif', fontSize: 22, lineHeight: 25, textAlign: 'center' }, left: { textAlign: 'left' }, right: { textAlign: 'right' }, reference: { color: '#ebde51', fontSize: 9, letterSpacing: 1, fontWeight: '800', textAlign: 'center', marginTop: 22 },
  controls: { marginTop: 15, borderRadius: 7, backgroundColor: '#fff', padding: 12, shadowColor: '#b6bac6', shadowOpacity: .12, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, controlLabel: { color: '#8c92a1', fontSize: 8, marginBottom: 7 }, backgrounds: { flexDirection: 'row', alignItems: 'center', gap: 10 }, backgroundChoice: { width: 32, height: 32, borderRadius: 17, overflow: 'hidden' }, selected: { borderWidth: 2, borderColor: '#103b92' }, backgroundImage: { flex: 1 }, backgroundImageRadius: { borderRadius: 17 }, solidChoice: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1f3b8f' }, addChoice: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#e1e2e6', alignItems: 'center', justifyContent: 'center' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }, optionButtons: { flexDirection: 'row', gap: 5 }, option: { width: 42, height: 31, borderRadius: 6, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center' }, serif: { fontFamily: 'serif', fontSize: 14 }, sans: { fontSize: 14 },
  shareButton: { alignSelf: 'center', marginTop: 9, width: 144, height: 35, borderRadius: 20, backgroundColor: '#103b92', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, elevation: 3 }, shareText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bottomNav: { position: 'absolute', left: 16, right: 16, bottom: 12, height: 48, backgroundColor: '#fff', borderRadius: 24, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#adb2bf', shadowOpacity: .1, shadowRadius: 14, shadowOffset: { width: 0, height: 3 }, elevation: 2 }, navItem: { width: 45, alignItems: 'center' }, navText: { color: '#8da0ba', fontSize: 7, marginTop: 1 }, activeNavText: { color: '#0a2d55', fontSize: 7, marginTop: 1 }, navDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#d4af37', marginTop: 2 },
});
