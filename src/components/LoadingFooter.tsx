import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedLoader } from './AnimatedLoader';

export const LoadingFooter: React.FC = () => {
  return (
    <View style={styles.container}>
      <AnimatedLoader size={40} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
