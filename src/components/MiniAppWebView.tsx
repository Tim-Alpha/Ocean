import React, { useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MiniApp } from '../types/miniApp';
import { useAuth } from '../contexts/AuthContext';
import { buildUserDataPayload, generateUserDataScript } from '../utils/userData';

interface MiniAppWebViewProps {
  visible: boolean;
  app: MiniApp | null;
  onClose: () => void;
}

export const MiniAppWebView: React.FC<MiniAppWebViewProps> = ({
  visible,
  app,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const { user } = useAuth();

  if (!app) return null;

  const handleOpenInBrowser = () => {
    Linking.openURL(app.entry_url);
    onClose();
  };

  const isWeb = Platform.OS === 'web';

  // Generate user data injection script if login is required
  const getUserDataScript = () => {
    if (app.is_login_required && user) {
      const userData = buildUserDataPayload(user, app.app_id);
      return generateUserDataScript(userData);
    }
    return '';
  };

  const handleWebViewLoadEnd = () => {
    // Inject user data after page loads if login is required
    if (app.is_login_required && user && webViewRef.current) {
      const userData = buildUserDataPayload(user, app.app_id);
      const script = generateUserDataScript(userData);
      webViewRef.current.injectJavaScript(script);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {app.display_name}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        {isWeb ? (
          <View style={styles.webFallback}>
            <Text style={styles.fallbackText}>
              WebView is only available on mobile devices
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={handleOpenInBrowser}
            >
              <Text style={styles.openButtonText}>Open in Browser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: app.entry_url }}
            style={styles.webview}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={getUserDataScript()}
            onLoadEnd={handleWebViewLoadEnd}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
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
  webview: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
