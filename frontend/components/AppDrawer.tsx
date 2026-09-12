import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DrawerProps = { visible: boolean; onClose: () => void };

const items = [
  ['book-outline', 'Versions de la Bible'],
  ['link-outline', 'Références Croisées'],
  ['chatbox-ellipses-outline', 'Commentaires'],
  ['create-outline', 'Journal Spirituel'],
  ['settings-outline', 'Paramètres'],
] as const;

export default function AppDrawer({ visible, onClose }: DrawerProps) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={styles.overlay}><View style={styles.drawer}><Text style={styles.brand}>Croire & Obéir</Text><Text style={styles.subtitle}>THE SACRED LIBRARY</Text><View style={styles.menu}>{items.map(([icon, label], index) => <TouchableOpacity key={label} style={[styles.item, index === 0 && styles.activeItem]}><Ionicons name={icon} size={18} color={index === 0 ? '#fff' : '#c9d4ed'} /><Text style={[styles.itemText, index === 0 && styles.activeText]}>{label}</Text>{index === 0 && <View style={styles.dot} />}</TouchableOpacity>)}</View><View style={styles.userRow}><View style={styles.avatar}><Text style={styles.avatarText}>E</Text></View><View><Text style={styles.userName}>Emmanuel</Text><Text style={styles.plan}>Plan de lecture: Jour 14</Text></View></View></View><Pressable style={styles.backdrop} onPress={onClose} /></View></Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' }, backdrop: { flex: 1, backgroundColor: 'rgba(9, 24, 50, 0.28)' },
  drawer: { width: '80%', backgroundColor: '#294b90', paddingTop: 14, paddingHorizontal: 16, paddingBottom: 36, borderTopRightRadius: 18, borderBottomRightRadius: 18, overflow: 'hidden' },
  brand: { color: '#f8dc44', fontSize: 25, lineHeight: 28, fontFamily: 'serif', marginTop: 35, fontStyle: 'italic', fontWeight: '700' }, subtitle: { color: '#d8e0f1', fontSize: 10, letterSpacing: .8, marginTop: 40 }, menu: { marginTop: 50, gap: 10 },
  item: { height: 45, paddingHorizontal: 12, borderRadius: 9, flexDirection: 'row', alignItems: 'center', gap: 15 }, activeItem: { backgroundColor: '#062c73' }, itemText: { color: '#c9d4ed', fontSize: 15, flexShrink: 1 }, activeText: { color: '#fff', fontWeight: '700' }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#f8dc44', marginLeft: 'auto' },
  userRow: { marginTop: 410, borderTopWidth: 1, borderTopColor: 'rgba(7, 34, 86, .35)', paddingTop: 18, flexDirection: 'row', alignItems: 'center', gap: 11 }, avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#062c73', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#f8dc44', fontWeight: '800' }, userName: { color: '#fff', fontSize: 15, fontWeight: '700' }, plan: { color: '#c9d4ed', fontSize: 15, marginTop: 2 },
});