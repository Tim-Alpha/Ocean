import React, { useState } from 'react';
import { FlatList, View, StyleSheet, RefreshControl } from 'react-native';
import { MiniAppItem } from './MiniAppItem';
import { LoadingFooter } from './LoadingFooter';
import { EmptyState } from './EmptyState';
import { MiniAppWebView } from './MiniAppWebView';
import { MiniAppVersionsModal } from './MiniAppVersionsModal';
import { StatusFilter } from './StatusFilter';
import { useMiniApps, MiniAppStatus } from '../hooks/useMiniApps';
import { MiniApp, MiniAppVersion } from '../types/miniApp';
import { GRID_CONFIG } from '../constants/layout';

export const MiniAppGrid: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<MiniAppStatus>('PENDING');
  const { apps, loading, hasMore, error, loadMore, refresh } = useMiniApps(selectedStatus);
  const [selectedApp, setSelectedApp] = useState<MiniApp | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [versionsModalVisible, setVersionsModalVisible] = useState(false);
  const [appForVersions, setAppForVersions] = useState<MiniApp | null>(null);

  const handleAppPress = (app: MiniApp) => {
    setSelectedApp(app);
    setWebViewVisible(true);
  };

  const handleAppDoublePress = (app: MiniApp) => {
    setAppForVersions(app);
    setVersionsModalVisible(true);
  };

  const handleCloseWebView = () => {
    setWebViewVisible(false);
    setTimeout(() => setSelectedApp(null), 300);
  };

  const handleCloseVersionsModal = () => {
    setVersionsModalVisible(false);
    setTimeout(() => setAppForVersions(null), 300);
  };

  const handleVersionSelect = (version: MiniAppVersion) => {
    if (appForVersions) {
      // Create a modified app object with the selected version's entry_url
      const appWithVersion: MiniApp = {
        ...appForVersions,
        entry_url: version.entry_url,
        version: version.version,
      };
      setSelectedApp(appWithVersion);
      setWebViewVisible(true);
    }
  };

  const handleStatusChange = (status: MiniAppStatus) => {
    setSelectedStatus(status);
  };

  const renderItem = ({ item }: { item: MiniApp }) => (
    <MiniAppItem 
      app={item} 
      onPress={handleAppPress}
      onDoublePress={handleAppDoublePress}
    />
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
      <StatusFilter 
        selectedStatus={selectedStatus} 
        onStatusChange={handleStatusChange} 
      />
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
      <MiniAppWebView
        visible={webViewVisible}
        app={selectedApp}
        onClose={handleCloseWebView}
      />
      <MiniAppVersionsModal
        visible={versionsModalVisible}
        app={appForVersions}
        onClose={handleCloseVersionsModal}
        onVersionSelect={handleVersionSelect}
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
