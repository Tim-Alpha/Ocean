import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { createHostBridgeScript, handleBridgeMessage } from '../utils/hostBridge';
import { getBundleJsUrl, MiniAppManifest } from '../utils/miniAppLoader';
import * as Device from 'expo-device';

interface MiniAppLoaderProps {
  manifest: MiniAppManifest;
  onClose?: () => void;
  onPermissionRequest?: (permission: string) => Promise<boolean>;
  onEvent?: (eventName: string, data: any) => void;
}

export default function MiniAppLoader({
  manifest,
  onClose,
  onPermissionRequest,
  onEvent,
}: MiniAppLoaderProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create the HTML template with root div
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #ffffff;
          }
          #root {
            width: 100%;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;

  // Get the bridge script
  const bridgeScript = createHostBridgeScript();
  
  // Get bundle URL from manifest
  const bundleJsUrl = getBundleJsUrl(manifest);

  // Inject the bundle after WebView is loaded
  useEffect(() => {
    if (webViewRef.current && !loading) {
      const injectBundleScript = `
        (function() {
          try {
            const script = document.createElement("script");
            script.src = "${bundleJsUrl}";
            script.onload = function() {
              console.log('Mini-app bundle loaded successfully');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'BUNDLE_LOADED',
                appId: "${manifest.id}"
              }));
            };
            script.onerror = function(error) {
              console.error('Error loading bundle:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'BUNDLE_ERROR',
                appId: "${manifest.id}",
                error: 'Failed to load bundle.js'
              }));
            };
            document.body.appendChild(script);
          } catch (error) {
            console.error('Error injecting bundle:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'BUNDLE_ERROR',
              appId: "${manifest.id}",
              error: error.message
            }));
          }
        })();
      `;

      // Small delay to ensure WebView is ready
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectBundleScript);
      }, 500);
    }
  }, [loading, bundleJsUrl, manifest.id]);

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'BUNDLE_LOADED') {
        setLoading(false);
        setError(null);
      } else if (message.type === 'BUNDLE_ERROR') {
        setLoading(false);
        setError(message.error || 'Failed to load mini-app');
      } else {
        // Handle bridge messages
        handleBridgeMessage(
          event.nativeEvent.data,
          async (permission: string) => {
            if (onPermissionRequest) {
              return await onPermissionRequest(permission);
            }
            return false;
          },
          (eventName: string, data: any) => {
            if (onEvent) {
              onEvent(eventName, data);
            }
          },
          async () => {
            // Return device info
            return {
              platform: Device.osName || 'unknown',
              version: Device.osVersion || 'unknown',
              modelName: Device.modelName || 'unknown',
            };
          },
          webViewRef
        );
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading mini-app</Text>
          <Text style={styles.errorDetail}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading {manifest.name}...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlTemplate }}
        injectedJavaScriptBeforeContentLoaded={bridgeScript}
        onMessage={handleMessage}
        onLoadEnd={() => {
          // WebView HTML is loaded, now we can inject the bundle
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError(nativeEvent.description || 'WebView error occurred');
          setLoading(false);
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

