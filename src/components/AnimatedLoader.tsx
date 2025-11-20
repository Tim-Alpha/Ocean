import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

interface AnimatedLoaderProps {
  size?: number;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({ size = 60 }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.loader,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: size * 0.08,
          transform: [{ rotate: spin }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    borderColor: '#E5E5EA',
    borderTopColor: '#007AFF',
  },
});
