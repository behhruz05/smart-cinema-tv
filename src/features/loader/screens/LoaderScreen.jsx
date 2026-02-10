import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlloPlayBrand } from '../../../shared/components/AlloPlayBrand';
import { LoadingBar } from '../../../shared/components/LoadingBar';

export function LoaderScreen() {
  const [progress, setProgress] = useState(0);
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowBrand(true);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {!showBrand ? (
        <>
          <Text style={styles.percent}>{progress}%</Text>
          <LoadingBar progress={progress} />
        </>
      ) : (
        <AlloPlayBrand />
      )}
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
