import { UserData, UserProfile } from '../types/user';

/**
 * Shapes the profile payload that comes from the API into the structure
 * MiniApps consume inside the WebView via `window.hostUserData`.
 */
export const buildUserDataPayload = (
  profile: UserProfile,
  miniAppId: string
): UserData => {
  return {
    mini_app_id: miniAppId,
    user_id: profile.user_id ?? '',
    username: profile.username ?? '',
    email: profile.email ?? '',
    first_name: profile.first_name ?? '',
    last_name: profile.last_name ?? '',
    profile_image_url: profile.profile_image_url ?? '',
  };
};

/**
 * Generates JavaScript code to inject user data into the WebView
 * This creates a window.hostUserData object that mini apps can access
 */
export const generateUserDataScript = (userData: UserData): string => {
  return `
    (function() {
      if (typeof window !== 'undefined') {
        window.hostUserData = ${JSON.stringify(userData)};
        
        // Dispatch a custom event when user data is available
        window.dispatchEvent(new CustomEvent('hostUserDataReady', {
          detail: window.hostUserData
        }));
        
        console.log('Host user data injected:', window.hostUserData);
      }
    })();
    true; // Required for WebView injection
  `;
};

