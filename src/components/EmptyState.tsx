import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedLoader } from './AnimatedLoader';

interface EmptyStateProps {
  loading: boolean;
  error: string | null;
  hasApps: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ loading, error, hasApps }) => {
  if (loading && !hasApps) {
    return (
      <View style={styles.container}>
        <AnimatedLoader size={50} />
        <Text style={styles.text}>Loading apps...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No apps available</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
  },
});
