import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MiniAppManifest } from '../types/miniApp';
import { loadAllMiniAppManifests } from '../services/miniAppService';
import MiniAppCard from './MiniAppCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

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

  if (loading) {
    return <LoadingState message="Loading mini-apps..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadManifests} />;
  }

  if (manifests.length === 0) {
    return <EmptyState message="No mini-apps available" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini-Apps</Text>
      <FlatList
        data={manifests}
        renderItem={({ item }) => (
          <MiniAppCard manifest={item} onPress={() => onSelectMiniApp(item)} />
        )}
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
});

