import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleLikeReel } from '../../../store/slice/reel.slice';
import { AppDispatch } from '../../../store';
import { Reel } from '../../../service/reel.service';
import { HeartIcon } from '../../../shared/icons/HeartIcon';
import { ShareIcon } from '../../../shared/icons/ShareIcon';

export function ReelAction({ reel }: { reel: Reel }) {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => dispatch(toggleLikeReel(reel.id))}
        style={styles.button}
      >
        <View style={styles.iconBtn}>
          <HeartIcon size={32}/>
        </View>
        <Text style={styles.count}>{reel.likes_count}</Text>

      </Pressable>
            <Pressable
        onPress={() => dispatch(toggleLikeReel(reel.id))}
        style={styles.button}
      >
        <View style={styles.iconBtn}>
          <ShareIcon size={40}/>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
  },
  iconBtn: {
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 16,
    marginTop: 16
  },
  count: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});
