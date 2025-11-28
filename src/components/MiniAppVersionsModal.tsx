import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MiniApp, MiniAppVersion } from '../types/miniApp';
import { useMiniAppVersions } from '../hooks/useMiniAppVersions';

interface MiniAppVersionsModalProps {
  visible: boolean;
  app: MiniApp | null;
  onClose: () => void;
  onVersionSelect: (version: MiniAppVersion) => void;
}

export const MiniAppVersionsModal: React.FC<MiniAppVersionsModalProps> = ({
  visible,
  app,
  onClose,
  onVersionSelect,
}) => {
  const { versions, loading, error, refresh } = useMiniAppVersions(app?.id || 0);

  if (!app) return null;

  const handleVersionPress = (version: MiniAppVersion) => {
    onVersionSelect(version);
    onClose();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'REJECTED':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const renderVersionItem = ({ item }: { item: MiniAppVersion }) => (
    <TouchableOpacity
      style={styles.versionItem}
      onPress={() => handleVersionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.versionHeader}>
        <Text style={styles.versionNumber}>{item.version}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.versionDate}>{formatDate(item.created_at)}</Text>
      {item.rejection_reason ? (
        <Text style={styles.rejectionReason}>
          Rejection: {item.rejection_reason}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={{ uri: app.app_logo_url }}
              style={styles.appIcon}
              resizeMode="cover"
            />
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {app.display_name}
              </Text>
              <Text style={styles.subtitle}>Select a version to test</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading versions...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : versions.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No versions available</Text>
          </View>
        ) : (
          <FlatList
            data={versions}
            renderItem={renderVersionItem}
            keyExtractor={(item, index) => `${item.version}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  versionItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  versionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    fontStyle: 'italic',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

