import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MiniAppManifest, loadAllMiniAppManifests } from '../utils/miniAppLoader';

interface MiniAppListProps {
  onSelectMiniApp: (manifest: MiniAppManifest) => void;
}

export default function MiniAppList({ onSelectMiniApp }: MiniAppListProps) {
  const [manifests, setManifests] = useState<MiniAppManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifests();
  }, []);

  const loadManifests = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedManifests = await loadAllMiniAppManifests();
      setManifests(loadedManifests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mini-apps');
      console.error('Error loading manifests:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderMiniApp = ({ item }: { item: MiniAppManifest }) => (
    <TouchableOpacity
      style={styles.miniAppCard}
      onPress={() => onSelectMiniApp(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.icon }}
        style={styles.appIcon}
        defaultSource={require('../../assets/icon.png')}
      />
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.appMeta}>
          <Text style={styles.appVersion}>v{item.version}</Text>
          <Text style={styles.appId}>{item.id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading mini-apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadManifests}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (manifests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No mini-apps available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini-Apps</Text>
      <FlatList
        data={manifests}
        renderItem={renderMiniApp}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  miniAppCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  appInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  appMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
    color: '#999999',
  },
  appId: {
    fontSize: 11,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});

