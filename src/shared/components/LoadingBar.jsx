import { View, StyleSheet } from 'react-native';

export function LoadingBar({ progress }) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    height: 6,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    backgroundColor: '#fff',
  },
});
