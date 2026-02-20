import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Reel } from '../../../service/reel.service';
import { ReelInfo } from './ReelInfo';
import { ReelAction } from './ReelAction';

const { height, width } = Dimensions.get('window');

interface ReelCardProps {
  reel: Reel;
  index: number;
  preferredFocus: boolean;
  nextFocusUp?: number;
  nextFocusDown?: number;
  onLikeFocus: (index: number) => void;
  setLikeRef: (index: number, node: any) => void;
}

export const ReelCard = React.memo(function ReelCard({
  reel,
  index,
  preferredFocus,
  nextFocusUp,
  nextFocusDown,
  onLikeFocus,
  setLikeRef,
}: ReelCardProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.infoSide}>
        <ReelInfo
          reel={reel}
          nextFocusUp={nextFocusUp}
          nextFocusDown={nextFocusDown}
        />
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
          <ReelAction
            reel={reel}
            preferredFocus={preferredFocus}
            nextFocusUp={nextFocusUp}
            nextFocusDown={nextFocusDown}
            onLikeFocus={() => onLikeFocus(index)}
            setLikeRef={node => setLikeRef(index, node)}
          />
        </View>
      </View>

      <View style={styles.rightSpacer} />
    </View>
  );
});

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
    width: width * 0.32,
    height: height * 0.72,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1f1f1f',
  },

  poster: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  actionSide: {
    marginLeft: 12,
    alignItems: 'center',
  },

  rightSpacer: {
    flex: 1,
  },
});
