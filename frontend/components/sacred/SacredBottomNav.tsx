import React, { ComponentProps } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sacredColors, sacredShadow } from '@/constants/sacredTheme';

type IconName = ComponentProps<typeof Ionicons>['name'];
export type SacredTab = 'home' | 'bible' | 'library' | 'profile';

type NavItem = {
  key: SacredTab;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  route: Href;
};

const navItems: NavItem[] = [
  {
    key: 'home',
    label: 'HOME',
    icon: 'home-outline',
    activeIcon: 'home',
    route: '/screens/(tabs)/Home' as Href,
  },
  {
    key: 'bible',
    label: 'BIBLE',
    icon: 'book-outline',
    activeIcon: 'book',
    route: '/Bible' as Href,
  },
  {
    key: 'library',
    label: 'LIBRARY',
    icon: 'library-outline',
    activeIcon: 'library',
    route: '/screens/(tabs)/Search' as Href,
  },
  {
    key: 'profile',
    label: 'PROFILE',
    icon: 'person-outline',
    activeIcon: 'person',
    route: '/screens/(tabs)/Profile' as Href,
  },
];

type SacredBottomNavProps = {
  activeTab: SacredTab;
};

export function SacredBottomNav({ activeTab }: SacredBottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { bottom: Math.max(14, insets.bottom + 8) }]}>
      {navItems.map((item) => {
        const active = item.key === activeTab;

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityLabel={item.label}
            activeOpacity={0.75}
            onPress={() => router.push(item.route)}
            style={styles.item}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Ionicons
                name={active ? item.activeIcon : item.icon}
                size={23}
                color={active ? sacredColors.navy : '#9BA6BA'}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    ...sacredShadow,
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 72,
    backgroundColor: sacredColors.white,
    borderRadius: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    zIndex: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    borderBottomColor: sacredColors.gold,
    borderBottomWidth: 1,
  },
  label: {
    color: '#95A1B4',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  labelActive: {
    color: sacredColors.navy,
  },
});
