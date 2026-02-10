import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlloPlayBrand } from '../../../shared/components/AlloPlayBrand';
import { LoadingBar } from '../../../shared/components/LoadingBar';

export function LoaderScreen({ navigation }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          navigation.replace('Login');
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>

      <Text style={styles.percent}>{progress}%</Text>

      <LoadingBar progress={progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010101',
    alignItems: 'center',
    justifyContent: 'center',
  },

  percent: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
});
