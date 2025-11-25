import { UserData } from '../types/user';

/**
 * Mock user data - In a real app, this would come from your authentication system
 * or user context/store
 */
export const getMockUserData = (miniAppId: string): UserData => {
  return {
    mini_app_id: miniAppId,
    user_id: '12345',
    username: 'johndoe',
    email: 'codewithaisha@gmail.com',
    first_name: 'Sachin',
    last_name: 'Kinha',
    profile_image_url: 'https://assets.socialverseapp.com/profile/kinha1731983912image_cropper_1731983900895.jpg.png'
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

