import React, { ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sacredColors } from '@/constants/sacredTheme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type DrawerItem = {
  label: string;
  icon: IconName;
  active?: boolean;
  route?: string;
};

const drawerItems: DrawerItem[] = [
  { label: 'Versions de la Bible', icon: 'book-outline', active: true, route: '/Bible' },
  { label: 'Références Croisées', icon: 'link-outline' },
  { label: 'Commentaires', icon: 'reader-outline' },
  { label: 'Journal Spirituel', icon: 'create-outline' },
  { label: 'Paramètres', icon: 'settings-outline', route: '/screens/(tabs)/Profile' },
];

type SacredDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function SacredDrawer({ visible, onClose }: SacredDrawerProps) {
  const router = useRouter();

  if (!visible) {
    return null;
  }

  const goTo = (route?: string) => {
    onClose();
    if (route) {
      router.push(route as never);
    }
  };

  return (
    <View style={styles.layer}>
      <TouchableOpacity
        activeOpacity={1}
        accessibilityLabel="Fermer le menu"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View style={styles.drawer}>
        <View style={styles.brandBlock}>
          <Text style={styles.brand}>Croire & Obéir</Text>
          <Text style={styles.brandSub}>THE SACRED LIBRARY</Text>
        </View>

        <View style={styles.menu}>
          {drawerItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.82}
              onPress={() => goTo(item.route)}
              style={[styles.menuItem, item.active && styles.menuItemActive]}
            >
              <Ionicons name={item.icon} size={19} color={item.active ? sacredColors.gold : '#AEC0E6'} />
              <Text style={[styles.menuText, item.active && styles.menuTextActive]}>
                {item.label}
              </Text>
              {item.active ? <View style={styles.activeDot} /> : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerLine} />
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>E</Text>
          </View>
          <View>
            <Text style={styles.userName}>Emmanuel</Text>
            <Text style={styles.userMeta}>Plan de lecture · Jour 14</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 17, 38, 0.22)',
  },
  drawer: {
    width: '82%',
    height: '100%',
    backgroundColor: sacredColors.drawerBlue,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 18,
  },
  brandBlock: {
    marginBottom: 22,
  },
  brand: {
    color: '#FFE27A',
    fontFamily: 'serif',
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  brandSub: {
    color: '#BBC9E8',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 8,
  },
  menu: {
    gap: 10,
  },
  menuItem: {
    height: 50,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: '#062F6F',
  },
  menuText: {
    color: '#CAD8F2',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  menuTextActive: {
    color: sacredColors.white,
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFE27A',
  },
  footerLine: {
    marginTop: 'auto',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#173E7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFE27A',
    fontSize: 16,
    fontWeight: '800',
  },
  userName: {
    color: sacredColors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  userMeta: {
    color: '#B5C5E6',
    fontSize: 11,
    marginTop: 2,
  },
});
