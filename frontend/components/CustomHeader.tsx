// components/CustomHeader.tsx
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Platform, StatusBar } from 'react-native';

interface CustomHeaderProps {
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode; 
  rightSlot?: React.ReactNode;  
}

export default function CustomHeader({ leftSlot, centerSlot, rightSlot }: CustomHeaderProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* Left Slot */}
        <View style={styles.leftContainer}>
          {typeof leftSlot === 'string' ? <Text style={styles.text}>{leftSlot}</Text> : leftSlot}
        </View>

        {/* Center Slot */}
        <View style={styles.centerContainer}>
          {typeof centerSlot === 'string' ? <Text style={styles.titleText}>{centerSlot}</Text> : centerSlot}
        </View>

        {/* Right Slot */}
        <View style={styles.rightContainer}>
          {typeof rightSlot === 'string' ? <Text style={styles.text}>{rightSlot}</Text> : rightSlot}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', // Keeps background white across all screens
    // Safe area handling for Android devices
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContainer: {
    height: 60, // Fixed height makes it look completely uniform on every page
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15, // Uniform side padding
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 2, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  text: {
    fontSize: 16,
    color: '#0a2d55',
    fontWeight: '500',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a2d55',
    textTransform: 'lowercase',
  },
});