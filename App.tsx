import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import MiniAppList from './src/components/MiniAppList';
import MiniAppLoader from './src/components/MiniAppLoader';
import { MiniAppManifest } from './src/utils/miniAppLoader';

export default function App() {
  const [selectedMiniApp, setSelectedMiniApp] = useState<MiniAppManifest | null>(null);

  const handleSelectMiniApp = (manifest: MiniAppManifest) => {
    setSelectedMiniApp(manifest);
  };

  const handleCloseMiniApp = () => {
    setSelectedMiniApp(null);
  };

  const handlePermissionRequest = async (permission: string): Promise<boolean> => {
    // Implement permission handling logic here
    // For now, we'll grant all permissions
    console.log(`Permission requested: ${permission}`);
    return true;
  };

  const handleEvent = (eventName: string, data: any) => {
    // Handle events from mini-apps
    console.log(`Event received from mini-app: ${eventName}`, data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {selectedMiniApp ? (
        <View style={styles.miniAppContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseMiniApp}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedMiniApp.name}</Text>
            <View style={styles.headerSpacer} />
          </View>
          <MiniAppLoader
            manifest={selectedMiniApp}
            onClose={handleCloseMiniApp}
            onPermissionRequest={handlePermissionRequest}
            onEvent={handleEvent}
          />
        </View>
      ) : (
        <MiniAppList onSelectMiniApp={handleSelectMiniApp} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  miniAppContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60, // Same width as back button to center the title
  },
});
