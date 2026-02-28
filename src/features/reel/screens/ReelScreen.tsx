import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  findNodeHandle,
  Platform,
  Pressable,
  ViewToken,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { Reel } from '../../../service/reel.service';
import {
  fetchInitialReels,
  fetchMoreReels,
  resetReels,
  setCurrentIndex,
} from '../../../store/slice/reel.slice';
import { ReelLoader } from '../components/ReelLoader';
import { ReelCard } from '../components/ReelCard';
import { ReelEmpty } from '../components/ReelEmpty';

const { height } = Dimensions.get('window');
const EMPTY_REEL_ITEM_ID = 'reel-empty-item';

type ReelListItem =
  | { type: 'reel'; reel: Reel }
  | { type: 'empty'; id: string };

export function ReelScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();
  const isTV = Platform.isTV;
  const listRef = useRef<FlatList<ReelListItem>>(null);
  const likeHandles = useRef<Record<number, number>>({});
  const emptyHandle = useRef<number | null>(null);
  const focusedIndexRef = useRef(0);
  const isProgrammaticScrollingRef = useRef(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const firstVisible = viewableItems[0];
      if (typeof firstVisible?.index !== 'number') return;
      dispatch(setCurrentIndex(firstVisible.index));
    },
  ).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 75 }).current;

  const {
    reels,
    loading,
    loadingMore,
    hasMore,
    currentIndex,
  } = useSelector(
    (state: RootState) => state.reel,
  );

  const listData: ReelListItem[] = hasMore
    ? reels.map(reel => ({ type: 'reel' as const, reel }))
    : [
        ...reels.map(reel => ({ type: 'reel' as const, reel })),
        { type: 'empty', id: EMPTY_REEL_ITEM_ID },
      ];

  useEffect(() => {
    dispatch(resetReels());
    dispatch(fetchInitialReels());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, []);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    dispatch(fetchMoreReels());
  };

  const handleLikeRef = (index: number, node: any) => {
    const handle = findNodeHandle(node);
    if (!handle || likeHandles.current[index] === handle) return;
    likeHandles.current[index] = handle;
    setFocusVersion(v => v + 1);
  };

  const handleLikeFocus = (index: number) => {
    if (index >= reels.length) return;
    if (index === focusedIndexRef.current) return;
    if (isProgrammaticScrollingRef.current) return;

    focusedIndexRef.current = index;
    dispatch(setCurrentIndex(index));
    isProgrammaticScrollingRef.current = true;
    if (programmaticScrollTimerRef.current) {
      clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = setTimeout(() => {
      isProgrammaticScrollingRef.current = false;
      programmaticScrollTimerRef.current = null;
    }, 320);

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0,
    });
  };

  if (loading && !reels.length) {
    return <ReelLoader />;
  }

  if (!loading && reels.length === 0) {
    return (
      <View style={styles.container}>
        <ReelEmpty />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={listData}
        extraData={focusVersion}
        keyExtractor={item =>
          item.type === 'empty' ? item.id : item.reel.id.toString()
        }
        pagingEnabled
        scrollEnabled={!isTV}
        snapToInterval={height}
        snapToAlignment="start"
        disableIntervalMomentum
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        bounces={false}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews={false}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          listRef.current?.scrollToOffset({
            offset: info.index * height,
            animated: true,
          });
        }}
        onMomentumScrollEnd={event => {
          const nextIndex = Math.round(
            event.nativeEvent.contentOffset.y / height,
          );
          focusedIndexRef.current = Math.max(0, nextIndex);
          dispatch(setCurrentIndex(nextIndex));
          isProgrammaticScrollingRef.current = false;
          if (programmaticScrollTimerRef.current) {
            clearTimeout(programmaticScrollTimerRef.current);
            programmaticScrollTimerRef.current = null;
          }
        }}
        onEndReachedThreshold={0.6}
        onEndReached={handleLoadMore}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
        renderItem={({ item, index }) =>
          item.type === 'empty' ? (
            <Pressable
              ref={node => {
                const handle = findNodeHandle(node);
                if (!handle || emptyHandle.current === handle) return;
                emptyHandle.current = handle;
                setFocusVersion(v => v + 1);
              }}
              focusable={isTV}
              {...(isTV
                ? ({
                    nextFocusUp: likeHandles.current[reels.length - 1],
                  } as any)
                : null)}
              onFocus={() => {
                focusedIndexRef.current = index;
                listRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0,
                });
              }}
              style={[styles.emptyScreen, { height }]}
            >
              <ReelEmpty />
            </Pressable>
          ) : (
              <ReelCard
                reel={item.reel}
                index={index}
                isActive={index === currentIndex}
                screenActive={isFocused}
                preferredFocus={index === 0}
                nextFocusUp={likeHandles.current[index - 1]}
                nextFocusDown={
                index === reels.length - 1
                  ? emptyHandle.current ?? undefined
                  : likeHandles.current[index + 1]
              }
              onLikeFocus={handleLikeFocus}
              setLikeRef={handleLikeRef}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyScreen: {
    width: '100%',
  },
});
