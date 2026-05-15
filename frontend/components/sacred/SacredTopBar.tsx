import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sacredColors } from '@/constants/sacredTheme';

type SacredTopBarProps = {
  title?: string;
  centerTitle?: string;
  rightLabel?: string;
  showSearch?: boolean;
  onMenuPress: () => void;
};

export function SacredTopBar({
  title = 'Croire & Obéir',
  centerTitle,
  rightLabel,
  showSearch = true,
  onMenuPress,
}: SacredTopBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { height: 58 + insets.top, paddingTop: insets.top }]}>
      <TouchableOpacity
        accessibilityLabel="Ouvrir le menu"
        onPress={onMenuPress}
        style={styles.iconButton}
      >
        <Ionicons name="menu" size={24} color={sacredColors.navy} />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {centerTitle ?? title}
      </Text>

      {rightLabel ? (
        <Text style={styles.rightLabel}>{rightLabel}</Text>
      ) : showSearch ? (
        <TouchableOpacity
          accessibilityLabel="Rechercher"
          onPress={() => router.push('/screens/(tabs)/Search' as never)}
          style={styles.iconButton}
        >
          <Ionicons name="search" size={23} color={sacredColors.navy} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 58,
    backgroundColor: sacredColors.paper,
    borderBottomColor: sacredColors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: sacredColors.navy,
    flex: 1,
    fontFamily: 'serif',
    fontSize: 19,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'center',
  },
  rightLabel: {
    color: sacredColors.navy,
    fontFamily: 'serif',
    fontSize: 17,
    fontStyle: 'italic',
    minWidth: 44,
    textAlign: 'right',
  },
});
