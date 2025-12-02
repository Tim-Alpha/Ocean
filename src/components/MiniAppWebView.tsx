import React, { useRef, useState, useEffect } from 'react';
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
import { generateAccessTokenScript } from '../utils/userData';
import { trackMiniAppActivity } from '../utils/activityTracking';

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
  const { user, authToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);

  // Track OPEN activity when modal becomes visible and user is logged in
  useEffect(() => {
    if (visible && app && user && authToken && !hasTrackedOpen) {
      trackMiniAppActivity(app.app_id, 'OPEN', authToken)
        .then((response) => {
          setAccessToken(response.access_token);
          setHasTrackedOpen(true);
        })
        .catch((error) => {
          console.error('Failed to track OPEN activity:', error);
        });
    }
  }, [visible, app, user, authToken, hasTrackedOpen]);

  // Reset tracking state when modal closes
  useEffect(() => {
    if (!visible) {
      setHasTrackedOpen(false);
      setAccessToken(null);
    }
  }, [visible]);

  // Inject access token when it becomes available (in case page loaded before token was received)
  useEffect(() => {
    if (app?.is_login_required && accessToken && webViewRef.current) {
      const script = generateAccessTokenScript(accessToken);
      webViewRef.current.injectJavaScript(script);
    }
  }, [accessToken, app]);

  if (!app) return null;

  const handleOpenInBrowser = () => {
    if (!app) return;
    Linking.openURL(app.entry_url);
    handleClose();
  };

  const handleClose = () => {
    // Track CLOSE activity before closing
    if (app && user && authToken && hasTrackedOpen) {
      trackMiniAppActivity(app.app_id, 'CLOSE', authToken).catch((error) => {
        console.error('Failed to track CLOSE activity:', error);
      });
    }
    onClose();
  };

  const isWeb = Platform.OS === 'web';

  // Generate access token injection script if login is required and access token is available
  const getAccessTokenScript = () => {
    if (app?.is_login_required && accessToken) {
      return generateAccessTokenScript(accessToken);
    }
    return '';
  };

  const handleWebViewLoadEnd = () => {
    // Inject access token after page loads if login is required and access token is available
    if (app?.is_login_required && accessToken && webViewRef.current) {
      const script = generateAccessTokenScript(accessToken);
      webViewRef.current.injectJavaScript(script);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {app.display_name}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            allowsProtectedMedia={true}
            androidLayerType="hardware"
            injectedJavaScript={getAccessTokenScript()}
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
