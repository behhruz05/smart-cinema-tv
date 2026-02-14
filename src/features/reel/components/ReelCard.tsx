import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Reel } from '../../../service/reel.service';
import { ReelInfo } from './ReelInfo';
import { ReelAction } from './ReelAction';

const { height, width } = Dimensions.get('window');

export function ReelCard({ reel }: { reel: Reel }) {
  return (
    <View style={styles.screen}>
      <View style={styles.infoSide}>
        <ReelInfo reel={reel} />
      </View>

      <View style={styles.reelWrapper}>
        <View style={styles.center}>
          <Image
            source={{ uri: reel.poster_url }}
            style={styles.poster}
            resizeMode="cover"
          />
        </View>

        <View style={styles.actionSide}>
          <ReelAction reel={reel} />
        </View>
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
    paddingBottom: 120,
    paddingHorizontal: 20,
  },

  infoSide: {
    flex: 1,
    justifyContent: 'center',
  },

  reelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  center: {
    width: width * 0.3,
    height: height * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
  },

  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  actionSide: {
    marginLeft: 16,
    alignItems: 'center',
  },

  rightSpacer: {
    flex: 1,
  },
});
