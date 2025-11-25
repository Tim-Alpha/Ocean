import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MiniAppGrid } from './src/components/MiniAppGrid';
import { LoginScreen } from './src/components/LoginScreen';
import { UserHeader } from './src/components/UserHeader';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const MainContent = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.main}>
      <UserHeader profile={user} />
      <View style={styles.content}>
        <MiniAppGrid />
      </View>
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <MainContent />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  main: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
