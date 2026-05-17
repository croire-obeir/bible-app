// components/CustomHeader.tsx
import React from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';

interface CustomHeaderProps {
  children?: React.ReactNode; // Dynamic container for all items passed from the parent
}

export default function CustomHeader({ children }: CustomHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContainer: {
    height: 60, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Stacks everything strictly to the right side
    paddingHorizontal: 15, 
  },
});