import React, { ReactNode, useState } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SacredBottomNav, SacredTab } from './SacredBottomNav';
import { SacredDrawer } from './SacredDrawer';
import { SacredTopBar } from './SacredTopBar';
import { sacredColors } from '@/constants/sacredTheme';

type SacredPageProps = {
  activeTab: SacredTab;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
  title?: string;
  centerTitle?: string;
  rightLabel?: string;
  showSearch?: boolean;
};

export function SacredPage({
  activeTab,
  children,
  contentStyle,
  scroll = true,
  title,
  centerTitle,
  rightLabel,
  showSearch = true,
}: SacredPageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const contentInsetStyle = { paddingBottom: 108 + insets.bottom };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SacredTopBar
        title={title}
        centerTitle={centerTitle}
        rightLabel={rightLabel}
        showSearch={showSearch}
        onMenuPress={() => setDrawerOpen(true)}
      />

      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentInsetStyle, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flexContent, contentInsetStyle, contentStyle]}>
          {children}
        </View>
      )}

      <SacredBottomNav activeTab={activeTab} />
      <SacredDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: sacredColors.page,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 108,
  },
  flexContent: {
    flex: 1,
  },
});
