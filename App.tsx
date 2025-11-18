import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import MiniAppList from './src/components/MiniAppList';
import MiniAppLoader from './src/components/MiniAppLoader';
import Header from './src/components/Header';
import { MiniAppManifest } from './src/types/miniApp';

export default function App() {
  const [selectedMiniApp, setSelectedMiniApp] = useState<MiniAppManifest | null>(null);

  const handleSelectMiniApp = (manifest: MiniAppManifest) => {
    setSelectedMiniApp(manifest);
  };

  const handleCloseMiniApp = () => {
    setSelectedMiniApp(null);
  };

  const handlePermissionRequest = async (permission: string): Promise<boolean> => {
    console.log(`Permission requested: ${permission}`);
    return true;
  };

  const handleEvent = (eventName: string, data: any) => {
    console.log(`Event received from mini-app: ${eventName}`, data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {selectedMiniApp ? (
        <View style={styles.miniAppContainer}>
          <Header title={selectedMiniApp.name} onBack={handleCloseMiniApp} />
          <MiniAppLoader
            manifest={selectedMiniApp}
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
});
