/**
 * Generates JavaScript code to inject access token into the WebView
 * This creates a window.hostAccessToken that mini apps can access
 */
export const generateAccessTokenScript = (accessToken: string): string => {
  return `
    (function() {
      if (typeof window !== 'undefined') {
        window.hostAccessToken = ${JSON.stringify(accessToken)};
        
        // Dispatch a custom event when access token is available
        window.dispatchEvent(new CustomEvent('hostAccessTokenReady', {
          detail: window.hostAccessToken
        }));
        
        console.log('Host access token injected');
      }
    })();
    true; // Required for WebView injection
  `;
};

