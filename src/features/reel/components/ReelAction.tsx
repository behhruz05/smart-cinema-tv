import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleLikeReel } from '../../../store/slice/reel.slice';
import { AppDispatch } from '../../../store';
import { Reel } from '../../../service/reel.service';
import { HeartIcon } from '../../../shared/icons/HeartIcon';

interface ReelActionProps {
  reel: Reel;
  preferredFocus?: boolean;
  nextFocusUp?: number;
  nextFocusDown?: number;
  onLikeFocus?: () => void;
  setLikeRef?: (node: any) => void;
}

export function ReelAction({
  reel,
  preferredFocus = false,
  nextFocusUp,
  nextFocusDown,
  onLikeFocus,
  setLikeRef,
}: ReelActionProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isTV = Platform.isTV;
  const [focusedLike, setFocusedLike] = React.useState(false);
  const tvDirectionalFocusProps = isTV
    ? ({
        nextFocusUp,
        nextFocusDown,
      } as any)
    : null;

  return (
    <View style={styles.container}>
      <Pressable
        ref={setLikeRef}
        focusable={isTV}
        hasTVPreferredFocus={isTV && preferredFocus}
        {...tvDirectionalFocusProps}
        onFocus={() => {
          setFocusedLike(true);
          onLikeFocus?.();
        }}
        onBlur={() => setFocusedLike(false)}
        onPress={() => dispatch(toggleLikeReel(reel.id))}
        style={styles.button}
      >
        <View
          style={styles.likeContent}
        >
          <View
            style={[
              styles.iconBtn,
              focusedLike && styles.iconBtnFocused,
            ]}
          >
            <HeartIcon size={32}/>
          </View>
          <Text style={styles.count}>{reel.likes_count}</Text>
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
  likeContent: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  iconBtn: {
    backgroundColor: '#1A1A1A',
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconBtnFocused: {
    borderColor: '#ffffff',
  },
  count: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
});
