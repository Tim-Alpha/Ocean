import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { HostUserDataPayload } from '../utils/userData';

interface HostUserDataModalProps {
  visible: boolean;
  onClose: () => void;
  miniAppId?: string;
}

export const HostUserDataModal: React.FC<HostUserDataModalProps> = ({
  visible,
  onClose,
  miniAppId,
}) => {
  const { user, authToken, placeId } = useAuth();

  const getHostUserData = (): HostUserDataPayload | null => {
    if (!user || !authToken) {
      return null;
    }

    return {
      mini_app_id: miniAppId || 'N/A',
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image_url: user.profile_image_url,
      access_token: authToken,
      place_id: placeId ?? null,
    };
  };

  const hostUserData = getHostUserData();

  const formatValue = (value: string | null | undefined): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    return String(value);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Host User Data</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {!hostUserData ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No user data available. Please log in first.
              </Text>
            </View>
          ) : (
            <View style={styles.dataContainer}>
              <Text style={styles.sectionTitle}>Data Passed to Mini Apps</Text>
              <Text style={styles.sectionSubtitle}>
                This is the data that will be injected into window.hostUserData
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>mini_app_id</Text>
                <Text style={styles.fieldValue}>{hostUserData.mini_app_id}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>user_id</Text>
                <Text style={styles.fieldValue}>{hostUserData.user_id}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>username</Text>
                <Text style={styles.fieldValue}>{hostUserData.username || 'N/A'}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>email</Text>
                <Text style={styles.fieldValue}>{hostUserData.email || 'N/A'}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>first_name</Text>
                <Text style={styles.fieldValue}>{hostUserData.first_name || 'N/A'}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>last_name</Text>
                <Text style={styles.fieldValue}>{hostUserData.last_name || 'N/A'}</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>profile_image_url</Text>
                <Text style={styles.fieldValue}>
                  {formatValue(hostUserData.profile_image_url)}
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>access_token</Text>
                <Text style={styles.fieldValue} numberOfLines={0}>
                  {hostUserData.access_token || 'null'}
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>place_id</Text>
                <Text style={styles.fieldValue}>
                  {hostUserData.place_id || 'Not set'}
                </Text>
                <Text style={styles.fieldHint}>
                  {hostUserData.place_id
                    ? 'Entered by user'
                    : 'Will be requested when opening a mini app'}
                </Text>
              </View>

              <View style={styles.jsonContainer}>
                <Text style={styles.jsonTitle}>JSON Representation:</Text>
                <Text style={styles.jsonText}>
                  {JSON.stringify(hostUserData, null, 2)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  dataContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fieldHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  jsonContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  jsonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  jsonText: {
    fontSize: 12,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

