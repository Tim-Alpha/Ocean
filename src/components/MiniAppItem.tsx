import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MiniApp } from '../types/miniApp';
import { GRID_METRICS, GRID_CONFIG } from '../constants/layout';

interface MiniAppItemProps {
  app: MiniApp;
  onPress?: (app: MiniApp) => void;
}

export const MiniAppItem: React.FC<MiniAppItemProps> = ({ app, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(app)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{ uri: app.app_logo_url }}
          style={styles.icon}
          resizeMode="contain"
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    width: '70%',
    height: '70%',
  },
  appName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
    lineHeight: 16,
  },
});
