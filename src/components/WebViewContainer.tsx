import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { createHostBridgeScript, handleBridgeMessage } from '../utils/hostBridge';
import { getBundleJsUrl } from '../services/miniAppService';
import { MiniAppManifest } from '../types/miniApp';
import * as Device from 'expo-device';
import LoadingOverlay from './LoadingOverlay';
import ErrorDisplay from './ErrorDisplay';

interface WebViewContainerProps {
  manifest: MiniAppManifest;
  onPermissionRequest?: (permission: string) => Promise<boolean>;
  onEvent?: (eventName: string, data: any) => void;
}

const HTML_TEMPLATE = `
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

export default function WebViewContainer({
  manifest,
  onPermissionRequest,
  onEvent,
}: WebViewContainerProps) {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bundleJsUrl = getBundleJsUrl(manifest);
  const bridgeScript = createHostBridgeScript();

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

      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectBundleScript);
      }, 500);
    }
  }, [loading, bundleJsUrl, manifest.id]);

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
    return <ErrorDisplay message={error} />;
  }

  return (
    <View style={styles.container}>
      {loading && <LoadingOverlay message={`Loading ${manifest.name}...`} />}
      <WebView
        ref={webViewRef}
        source={{ html: HTML_TEMPLATE }}
        injectedJavaScriptBeforeContentLoaded={bridgeScript}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
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
});

