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

export interface HostUserDataPayload {
  mini_app_id: string;
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_image_url: string;
  access_token: string | null;
  place_id: string | null;
}

/**
 * Generates JavaScript code to inject user identity data into the WebView.
 * This creates a window.hostUserData object that mini apps can access.
 */
export const generateHostUserDataScript = (
  payload: HostUserDataPayload
): string => {
  const serialized = JSON.stringify(payload);

  return `
    (function() {
      if (typeof window !== 'undefined') {
        window.hostUserData = ${serialized};

        // Dispatch a custom event when user data is available
        window.dispatchEvent(new CustomEvent('hostUserDataReady', {
          detail: window.hostUserData
        }));

        console.log('Host user data injected');
      }
    })();
    true; // Required for WebView injection
  `;
};


