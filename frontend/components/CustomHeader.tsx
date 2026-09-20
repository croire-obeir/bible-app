// // components/CustomHeader.tsx
// import React from 'react';
// import { StyleSheet, View, SafeAreaView, Platform, StatusBar, Text } from 'react-native';

// interface CustomHeaderProps {
//   children?: React.ReactNode;
//   leftSlot?: React.ReactNode;
//   centerSlot?: React.ReactNode;
//   rightSlot?: React.ReactNode;
// }

// export default function CustomHeader({ children, leftSlot, centerSlot, rightSlot }: CustomHeaderProps) {
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.headerContainer}>
//         <View style={styles.sideSlot}>{leftSlot}</View>
//         <View pointerEvents="none" style={styles.centerSlot}>
//           {typeof centerSlot === 'string' ? <Text style={styles.title}>{centerSlot}</Text> : centerSlot}
//         </View>
//         <View style={styles.rightSlot}>{children ?? rightSlot}</View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: '#f5e9dc',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   headerContainer: {
//     height: 52,
//     justifyContent: 'center',
//     paddingHorizontal: 14,
//   },
//   sideSlot: {
//     position: 'absolute',
//     left: 14,
//     height: 52,
//     justifyContent: 'center',
//   },
//   centerSlot: { alignItems: 'center' },
//   rightSlot: {
//     position: 'absolute',
//     right: 14,
//     height: 52,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 14,
//   },
//   title: {
//     color: '#082d70',
//     fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
//     fontSize: 16,
//     fontStyle: 'italic',
//   },
// });


import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = {
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftOnPress?: (event: GestureResponderEvent) => void;

  title?: string;

  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightOnPress?: (event: GestureResponderEvent) => void;
};

export default function Header({
  leftIcon,
  leftOnPress,
  title,
  rightIcon,
  rightOnPress,
}: HeaderProps) {
  return (
    <View style={styles.header}>

      {/* LEFT SECTION */}
      {leftIcon ? (
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={leftOnPress}
        >
          <Ionicons
            name={leftIcon}
            size={21}
            color="#0A2D55"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}

      {/* CENTER SECTION */}
      {title ? (
        <Text style={styles.logo}>
          {title}
        </Text>
      ) : (
        <View style={styles.logo} />
      )}

      {/* RIGHT SECTION */}
      {rightIcon ? (
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={rightOnPress}
        >
          <Ionicons
            name={rightIcon}
            size={21}
            color="#0A2D55"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerButton} />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
   header: {
    height: 100,
    width: '100%',
    backgroundColor: '#c7ba9d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 20,
  },

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontFamily: 'serif',
    fontStyle: 'normal',
    fontSize: 25,
    fontWeight: '700',
    color: '#233A59',
    marginTop: 1,
  },
});