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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { MiniApp } from '../types/miniApp';
import { useAuth } from '../contexts/AuthContext';
import {
  generateAccessTokenScript,
  generateHostUserDataScript,
} from '../utils/userData';
import { trackMiniAppActivity } from '../utils/activityTracking';
import { updatePresence } from '../utils/presence';

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
  const { user, authToken, placeId, setPlaceId } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasTrackedOpen, setHasTrackedOpen] = useState(false);
  const [placeInput, setPlaceInput] = useState('');

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

  // Helper function to generate user data script - defined before hooks that use it
  const getUserDataScript = React.useCallback(() => {
    if (!app?.is_login_required || !user || !authToken) {
      return '';
    }

    return generateHostUserDataScript({
      mini_app_id: app.app_id,
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_image_url: user.profile_image_url,
      // Expose the main auth token as access_token for mini apps
      access_token: authToken,
      place_id: placeId ?? null,
    });
  }, [app?.is_login_required, app?.app_id, user, authToken, placeId]);

  // Inject access token when it becomes available (in case page loaded before token was received)
  useEffect(() => {
    if (app?.is_login_required && accessToken && webViewRef.current) {
      const script = generateAccessTokenScript(accessToken);
      webViewRef.current.injectJavaScript(script);
    }
  }, [accessToken, app]);

  // Re-inject user data whenever it changes (e.g. place_id set after initial load)
  useEffect(() => {
    if (app?.is_login_required && webViewRef.current && user && authToken) {
      const script = getUserDataScript();
      if (script) {
        webViewRef.current.injectJavaScript(script);
      }
    }
  }, [app?.is_login_required, user, authToken, getUserDataScript]);

  // Early return after all hooks - this is safe as long as all hooks are called before
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

  const getInjectedScript = () => {
    // Combine both scripts so mini apps receive both hostAccessToken and hostUserData
    return `${getAccessTokenScript()}${getUserDataScript()}`;
  };

  const handleWebViewLoadEnd = () => {
    // Inject access token after page loads if login is required and access token is available
    if (app?.is_login_required && webViewRef.current) {
      const script = getInjectedScript();
      if (script) {
        webViewRef.current.injectJavaScript(script);
      }
    }
  };

  const handleSavePlaceId = () => {
    const trimmed = placeInput.trim();
    if (!trimmed) {
      return;
    }
    setPlaceId(trimmed);
    
    // Update presence in the background - fire and forget, don't block UI
    updatePresence(trimmed, authToken, 'active', '0').catch((error) => {
      // Already handled in updatePresence, but catch here to prevent unhandled promise rejection
      console.warn('Background presence update failed:', error);
    });
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
          <View style={styles.content}>
            {app.is_login_required && !placeId ? (
              <View style={styles.placeIdOverlay}>
                <Text style={styles.placeIdTitle}>Select Place</Text>
                <Text style={styles.placeIdSubtitle}>
                  Enter the place ID you want to use for this session.
                </Text>
                <TextInput
                  style={styles.placeIdInput}
                  placeholder="Enter place_id"
                  value={placeInput}
                  onChangeText={setPlaceInput}
                  autoCapitalize="none"
                  onSubmitEditing={handleSavePlaceId}
                />
                <TouchableOpacity
                  style={styles.placeIdButton}
                  onPress={handleSavePlaceId}
                >
                  <Text style={styles.placeIdButtonText}>Continue</Text>
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
                injectedJavaScript={getInjectedScript()}
                onLoadEnd={handleWebViewLoadEnd}
              />
            )}
          </View>
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
  content: {
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
  placeIdOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  placeIdTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  placeIdSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  placeIdInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
    marginBottom: 16,
  },
  placeIdButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  placeIdButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
