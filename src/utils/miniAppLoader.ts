import { Platform } from 'react-native';

export interface MiniAppFile {
  name: string;
  url: string;
}

export interface MiniAppManifest {
  id: string;
  name: string;
  icon: string;
  version: string;
  requiredPermissions: string[];
  optionalPermissions: string[];
  description: string;
  files: MiniAppFile[];
}

export interface StoreApiResponse {
  apps: MiniAppManifest[];
  count: number;
}

/**
 * Gets the correct API base URL based on platform
 * - Android Emulator: Uses 10.0.2.2 (maps to host machine's localhost)
 * - Android Physical Device: Uses your computer's IP address (192.168.1.3)
 * - iOS Simulator/Web: Uses localhost
 * 
 * Note: If your IP address changes, update the ANDROID_PHYSICAL_DEVICE_IP constant below
 */
const ANDROID_PHYSICAL_DEVICE_IP = '192.168.1.3'; // Your computer's IP address

function getApiBaseUrl(): string {
  if (!__DEV__) {
    return 'https://your-api-server.com';
  }
  
  // For Android
  if (Platform.OS === 'android') {
    // For physical devices, use your computer's IP address
    // For emulator, you could use '10.0.2.2' but we'll use IP for both to keep it simple
    return `http://${ANDROID_PHYSICAL_DEVICE_IP}:9010`;
  }
  
  // For iOS simulator and web, localhost works
  return 'http://localhost:9010';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Fetches all available mini-apps from the API
 */
export async function fetchMiniAppsFromAPI(): Promise<MiniAppManifest[]> {
  try {
    const apiUrl = `${API_BASE_URL}/api/v1/store/apps`;
    console.log(`Fetching mini-apps from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: StoreApiResponse = await response.json();
    
    if (!data.apps || !Array.isArray(data.apps)) {
      throw new Error('Invalid API response format: expected "apps" array');
    }
    
    // Validate each app
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
        `4. Current API URL: ${API_BASE_URL}`
      );
    }
    throw error;
  }
}

/**
 * Gets the bundle.js URL for a mini-app from its manifest
 */
export function getBundleJsUrl(manifest: MiniAppManifest): string {
  const bundleFile = manifest.files?.find((file) => file.name === 'bundle.js');
  
  if (!bundleFile) {
    throw new Error(`Bundle file not found for ${manifest.id}`);
  }
  
  return bundleFile.url;
}

/**
 * Gets the manifest.json URL for a mini-app from its manifest
 */
export function getManifestUrl(manifest: MiniAppManifest): string {
  const manifestFile = manifest.files?.find((file) => file.name === 'manifest.json');
  
  if (!manifestFile) {
    throw new Error(`Manifest file not found for ${manifest.id}`);
  }
  
  return manifestFile.url;
}

/**
 * Loads all available mini-app manifests from the API
 */
export async function loadAllMiniAppManifests(): Promise<MiniAppManifest[]> {
  try {
    return await fetchMiniAppsFromAPI();
  } catch (error) {
    console.error('Error loading mini-app manifests:', error);
    throw error;
  }
}

