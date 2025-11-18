import * as FileSystem from 'expo-file-system';

/**
 * Copies mini-app files from project to document directory
 * This function should be called on app initialization
 */
export async function copyMiniAppFilesFromProject(): Promise<void> {
  const miniAppsStorePath = `${FileSystem.documentDirectory}miniAppsStore/`;
  
  // Ensure miniAppsStore directory exists
  const dirInfo = await FileSystem.getInfoAsync(miniAppsStorePath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(miniAppsStorePath, { intermediates: true });
  }
  
  // List of mini-apps to copy
  const miniApps = ['com.todo.mini', 'com.movie.mini'];
  
  for (const appId of miniApps) {
    await copyMiniAppFiles(appId);
  }
}

/**
 * Copies files for a specific mini-app
 * For development, we'll read from the project directory using a workaround
 */
async function copyMiniAppFiles(appId: string): Promise<void> {
  const targetPath = `${FileSystem.documentDirectory}miniAppsStore/${appId}/`;
  const manifestPath = `${targetPath}manifest.json`;
  const bundlePath = `${targetPath}bundle.js`;
  
  // Check if files already exist
  const manifestExists = await FileSystem.getInfoAsync(manifestPath);
  const bundleExists = await FileSystem.getInfoAsync(bundlePath);
  
  if (manifestExists.exists && bundleExists.exists) {
    console.log(`Mini-app ${appId} files already exist, skipping copy`);
    return;
  }
  
  // Ensure target directory exists
  const dirInfo = await FileSystem.getInfoAsync(targetPath);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(targetPath, { intermediates: true });
  }
  
  // For development, we need to read from the project's miniAppsStore
  // Since we can't directly access project files, we'll use a workaround:
  // Read from a local server or use bundled assets
  
  // Try to read from localhost (if a dev server is running)
  try {
    const baseUrl = 'http://localhost:8080';
    const manifestUrl = `${baseUrl}/miniAppsStore/${appId}/manifest.json`;
    const bundleUrl = `${baseUrl}/miniAppsStore/${appId}/bundle.js`;
    
    // Download manifest
    const manifestResponse = await fetch(manifestUrl);
    if (manifestResponse.ok) {
      const manifestContent = await manifestResponse.text();
      await FileSystem.writeAsStringAsync(manifestPath, manifestContent);
      console.log(`Copied manifest for ${appId}`);
    }
    
    // Download bundle
    const bundleResponse = await fetch(bundleUrl);
    if (bundleResponse.ok) {
      const bundleContent = await bundleResponse.text();
      await FileSystem.writeAsStringAsync(bundlePath, bundleContent);
      console.log(`Copied bundle for ${appId}`);
    }
  } catch (error) {
    console.warn(`Could not copy files from server for ${appId}, files must be manually copied:`, error);
    // Files will need to be manually copied or bundled as assets
    throw new Error(
      `Mini-app files not found for ${appId}. ` +
      `Please copy files from miniAppsStore/${appId}/ to the app's document directory, ` +
      `or run a local server at http://localhost:8080`
    );
  }
}

/**
 * Alternative: Copy from bundled assets (if files are bundled as assets)
 * This would require adding files to assets folder and updating app.json
 */
async function copyFromAssets(appId: string): Promise<void> {
  // This would require:
  // 1. Adding miniAppsStore to assets in app.json
  // 2. Using Asset.fromModule() to get the asset
  // 3. Copying the asset to document directory
  
  // For now, this is a placeholder for future implementation
  throw new Error('Asset-based copying not yet implemented');
}

