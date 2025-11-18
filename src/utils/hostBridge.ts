/**
 * Secure bridge that mini-apps use to communicate with the Host App
 * This is injected into the WebView before the mini-app bundle loads
 */
export function createHostBridgeScript(): string {
  return `
    (function() {
      // Create the secure bridge object
      window.hostBridge = {
        /**
         * Request a permission from the host app
         * @param {string} permission - The permission to request
         * @returns {Promise<boolean>} - Whether the permission was granted
         */
        requestPermission: function(permission) {
          return new Promise(function(resolve, reject) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'REQUEST_PERMISSION',
              payload: { permission: permission }
            }));
            
            // Store the resolve/reject for when we get a response
            window._pendingPermissionRequests = window._pendingPermissionRequests || {};
            window._pendingPermissionRequests[permission] = { resolve, reject };
          });
        },
        
        /**
         * Emit an event to the host app
         * @param {string} eventName - Name of the event
         * @param {*} data - Event data
         */
        emitEvent: function(eventName, data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'EMIT_EVENT',
            payload: {
              eventName: eventName,
              data: data
            }
          }));
        },
        
        /**
         * Get device information from the host
         * @returns {Promise<Object>} - Device information
         */
        getDeviceInfo: function() {
          return new Promise(function(resolve, reject) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'GET_DEVICE_INFO',
              payload: {}
            }));
            
            window._pendingDeviceInfoRequest = { resolve, reject };
          });
        }
      };
      
      // Initialize pending requests storage
      window._pendingPermissionRequests = {};
      window._pendingDeviceInfoRequest = null;
      
      console.log('Host bridge initialized');
    })();
  `;
}

/**
 * Handle messages from the WebView (mini-app)
 */
export interface BridgeMessage {
  type: 'REQUEST_PERMISSION' | 'EMIT_EVENT' | 'GET_DEVICE_INFO';
  payload: any;
}

export function handleBridgeMessage(
  message: string,
  onPermissionRequest: (permission: string) => Promise<boolean>,
  onEvent: (eventName: string, data: any) => void,
  onDeviceInfoRequest: () => Promise<any>,
  webViewRef?: any
): void {
  try {
    const bridgeMessage: BridgeMessage = JSON.parse(message);
    
    switch (bridgeMessage.type) {
      case 'REQUEST_PERMISSION':
        onPermissionRequest(bridgeMessage.payload.permission)
          .then((granted) => {
            if (webViewRef?.current) {
              // Send response back to WebView
              const responseScript = `
                (function() {
                  if (window._pendingPermissionRequests && window._pendingPermissionRequests['${bridgeMessage.payload.permission}']) {
                    window._pendingPermissionRequests['${bridgeMessage.payload.permission}'].resolve(${granted});
                    delete window._pendingPermissionRequests['${bridgeMessage.payload.permission}'];
                  }
                })();
              `;
              webViewRef.current.injectJavaScript(responseScript);
            }
          })
          .catch((error) => {
            console.error('Error handling permission request:', error);
            if (webViewRef?.current) {
              const errorScript = `
                (function() {
                  if (window._pendingPermissionRequests && window._pendingPermissionRequests['${bridgeMessage.payload.permission}']) {
                    window._pendingPermissionRequests['${bridgeMessage.payload.permission}'].reject(new Error('${error.message}'));
                    delete window._pendingPermissionRequests['${bridgeMessage.payload.permission}'];
                  }
                })();
              `;
              webViewRef.current.injectJavaScript(errorScript);
            }
          });
        break;
        
      case 'EMIT_EVENT':
        onEvent(
          bridgeMessage.payload.eventName,
          bridgeMessage.payload.data
        );
        break;
        
      case 'GET_DEVICE_INFO':
        onDeviceInfoRequest()
          .then((deviceInfo) => {
            if (webViewRef?.current) {
              const responseScript = `
                (function() {
                  if (window._pendingDeviceInfoRequest) {
                    window._pendingDeviceInfoRequest.resolve(${JSON.stringify(deviceInfo)});
                    window._pendingDeviceInfoRequest = null;
                  }
                })();
              `;
              webViewRef.current.injectJavaScript(responseScript);
            }
          })
          .catch((error) => {
            console.error('Error getting device info:', error);
            if (webViewRef?.current) {
              const errorScript = `
                (function() {
                  if (window._pendingDeviceInfoRequest) {
                    window._pendingDeviceInfoRequest.reject(new Error('${error.message}'));
                    window._pendingDeviceInfoRequest = null;
                  }
                })();
              `;
              webViewRef.current.injectJavaScript(errorScript);
            }
          });
        break;
        
      default:
        console.warn('Unknown bridge message type:', bridgeMessage.type);
    }
  } catch (error) {
    console.error('Error parsing bridge message:', error);
  }
}

