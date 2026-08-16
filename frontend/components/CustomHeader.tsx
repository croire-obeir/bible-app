// components/CustomHeader.tsx
import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, Text } from 'react-native';

interface CustomHeaderProps {
  children?: React.ReactNode;
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export default function CustomHeader({ children, leftSlot, centerSlot, rightSlot }: CustomHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.sideSlot}>{leftSlot}</View>
        <View pointerEvents="none" style={styles.centerSlot}>
          {typeof centerSlot === 'string' ? <Text style={styles.title}>{centerSlot}</Text> : centerSlot}
        </View>
        <View style={styles.rightSlot}>{children ?? rightSlot}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f5e9dc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  sideSlot: {
    position: 'absolute',
    left: 14,
    height: 52,
    justifyContent: 'center',
  },
  centerSlot: { alignItems: 'center' },
  rightSlot: {
    position: 'absolute',
    right: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    color: '#082d70',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: 16,
    fontStyle: 'italic',
  },
});
