import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MiniAppManifest } from '../types/miniApp';

interface MiniAppCardProps {
  manifest: MiniAppManifest;
  onPress: () => void;
}

export default function MiniAppCard({ manifest, onPress }: MiniAppCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: manifest.icon }}
        style={styles.icon}
        defaultSource={require('../../assets/icon.png')}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{manifest.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {manifest.description}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.version}>v{manifest.version}</Text>
          <Text style={styles.id}>{manifest.id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#999999',
  },
  id: {
    fontSize: 11,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
});

