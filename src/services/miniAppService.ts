import { Platform } from 'react-native';
import { MiniAppManifest, StoreApiResponse } from '../types/miniApp';

const ANDROID_PHYSICAL_DEVICE_IP = '192.168.1.3';

function getApiBaseUrl(): string {
  if (!__DEV__) {
    return 'https://your-api-server.com';
  }
  
  if (Platform.OS === 'android') {
    return `http://${ANDROID_PHYSICAL_DEVICE_IP}:9010`;
  }
  
  return 'http://localhost:9010';
}

export async function fetchMiniAppsFromAPI(): Promise<MiniAppManifest[]> {
  try {
    const apiUrl = `${getApiBaseUrl()}/api/v1/store/apps`;
    console.log(`Fetching mini-apps from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: StoreApiResponse = await response.json();
    
    if (!data.apps || !Array.isArray(data.apps)) {
      throw new Error('Invalid API response format: expected "apps" array');
    }
    
    const validApps = data.apps.filter((app) => {
      if (!app.id || !app.name) {
        console.warn(`Invalid app in API response: missing id or name`, app);
        return false;
      }
      if (!app.files || !Array.isArray(app.files)) {
        console.warn(`Invalid app in API response: missing files array`, app);
        return false;
      }
      const hasBundle = app.files.some((file) => file.name === 'bundle.js');
      if (!hasBundle) {
        console.warn(`Invalid app in API response: missing bundle.js file`, app);
        return false;
      }
      return true;
    });
    
    console.log(`Successfully loaded ${validApps.length} mini-app(s) from API`);
    return validApps;
  } catch (error) {
    console.error('Error fetching mini-apps from API:', error);
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error(
        `Network request failed. Make sure:\n` +
        `1. API server is running at http://localhost:9010 on your computer\n` +
        `2. Your Android device and computer are on the same Wi-Fi network\n` +
        `3. Firewall allows connections on port 9010\n` +
        `4. Current API URL: ${getApiBaseUrl()}`
      );
    }
    throw error;
  }
}

export function getBundleJsUrl(manifest: MiniAppManifest): string {
  const bundleFile = manifest.files?.find((file) => file.name === 'bundle.js');
  
  if (!bundleFile) {
    throw new Error(`Bundle file not found for ${manifest.id}`);
  }
  
  return bundleFile.url;
}

export async function loadAllMiniAppManifests(): Promise<MiniAppManifest[]> {
  try {
    return await fetchMiniAppsFromAPI();
  } catch (error) {
    console.error('Error loading mini-app manifests:', error);
    throw error;
  }
}

