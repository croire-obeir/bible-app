
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderAction = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  showDot?: boolean;
};

type AppHeaderProps = {
  actions?: HeaderAction[];
  style?: ViewStyle;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  actions = [],
  style,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={`${action.name}-${index}`}
            style={styles.headerButton}
            activeOpacity={0.7}
            onPress={action.onPress}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={action.name}
                size={23}
                color="#1F2937"
              />

              {action.showDot && (
                <View style={styles.notificationDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 60,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingVertical: 8,
      paddingTop: 45,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  iconContainer: {
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E53935',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
