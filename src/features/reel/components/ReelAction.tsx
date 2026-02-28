import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikeReel } from '../../../store/slice/reel.slice';
import { AppDispatch, RootState } from '../../../store';
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
  const likePending = useSelector((state: RootState) => !!state.reel.likePending[reel.id]);
  const [focusedLike, setFocusedLike] = React.useState(false);
  const skipNextPressRef = React.useRef(false);
  const tvDirectionalFocusProps = isTV
    ? ({
        nextFocusUp,
        nextFocusDown,
      } as any)
    : null;
  const handleLikePress = React.useCallback(() => {
    if (likePending) return;
    dispatch(toggleLikeReel({ reelId: reel.id, isLiked: reel.is_liked }));
  }, [dispatch, likePending, reel.id, reel.is_liked]);

  const handleLikeKeyDown = React.useCallback(
    (event: any) => {
      const key = event?.nativeEvent?.key;
      if (key !== 'Enter' && key !== 'Select' && key !== ' ') return;
      skipNextPressRef.current = true;
      handleLikePress();
    },
    [handleLikePress],
  );

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
        onKeyDown={handleLikeKeyDown}
        onPress={() => {
          if (skipNextPressRef.current) {
            skipNextPressRef.current = false;
            return;
          }
          handleLikePress();
        }}
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
            <HeartIcon size={32} filled={reel.is_liked} />
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
