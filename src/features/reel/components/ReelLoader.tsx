import React from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');

export function ReelLoader() {
  return (
    <View style={styles.screen}>
      <View style={styles.infoSide} />

      <View style={styles.reelWrapper}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
        <View style={styles.actionSide} />
      </View>

      <View style={styles.rightSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    height: height,
    width: width,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#101010',
    paddingBottom: 110,
    paddingHorizontal: 20,
  },
  infoSide: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  reelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  center: {
    width: width * 0.28,
    height: height * 0.76,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1f1f1f',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionSide: {
    marginLeft: 12,
    alignItems: 'center',
    width: 60,
  },
  rightSpacer: {
    flex: 1,
  },
});
