import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { MiniAppItem } from './MiniAppItem';
import { LoadingFooter } from './LoadingFooter';
import { EmptyState } from './EmptyState';
import { useMiniApps } from '../hooks/useMiniApps';
import { MiniApp } from '../types/miniApp';
import { GRID_CONFIG } from '../constants/layout';

export const MiniAppGrid: React.FC = () => {
  const { apps, loading, hasMore, error, loadMore, refresh } = useMiniApps();

  const handleAppPress = (app: MiniApp) => {
    console.log('Pressed app:', app.display_name);
  };

  const renderItem = ({ item }: { item: MiniApp }) => (
    <MiniAppItem app={item} onPress={handleAppPress} />
  );

  const renderFooter = () => {
    if (loading && apps.length > 0) {
      return <LoadingFooter />;
    }
    return null;
  };

  const renderEmpty = () => (
    <EmptyState loading={loading} error={error} hasApps={apps.length > 0} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={GRID_CONFIG.COLUMNS}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContent: {
    padding: GRID_CONFIG.PADDING,
    paddingTop: 30,
  },
});
