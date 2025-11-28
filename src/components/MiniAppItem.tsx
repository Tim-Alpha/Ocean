import React, { useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MiniApp } from '../types/miniApp';
import { GRID_METRICS, GRID_CONFIG } from '../constants/layout';

interface MiniAppItemProps {
  app: MiniApp;
  onPress?: (app: MiniApp) => void;
  onDoublePress?: (app: MiniApp) => void;
}

export const MiniAppItem: React.FC<MiniAppItemProps> = ({ app, onPress, onDoublePress }) => {
  const lastTap = useRef<number | null>(null);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DOUBLE_TAP_DELAY = 300; // milliseconds

  const handlePress = () => {
    const now = Date.now();
    
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      // Double tap detected - cancel single tap timer
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
        singleTapTimer.current = null;
      }
      if (onDoublePress) {
        onDoublePress(app);
      }
      lastTap.current = null;
    } else {
      // First tap - set up single tap timer
      lastTap.current = now;
      if (singleTapTimer.current) {
        clearTimeout(singleTapTimer.current);
      }
      singleTapTimer.current = setTimeout(() => {
        // Single tap - no second tap occurred
        onPress?.(app);
        lastTap.current = null;
        singleTapTimer.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: app.app_logo_url }}
          style={styles.icon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.appName} numberOfLines={2} ellipsizeMode="tail">
        {app.display_name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: GRID_METRICS.ITEM_SIZE,
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: GRID_CONFIG.ITEM_SPACING,
  },
  iconContainer: {
    width: GRID_METRICS.ITEM_SIZE - 16,
    height: GRID_METRICS.ITEM_SIZE - 16,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  appName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: 16,
  },
});
