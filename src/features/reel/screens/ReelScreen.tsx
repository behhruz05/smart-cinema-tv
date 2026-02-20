import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  findNodeHandle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { Reel } from '../../../service/reel.service';
import { fetchReels, resetReels } from '../../../store/slice/reel.slice';
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
  const listRef = useRef<FlatList<ReelListItem>>(null);
  const likeHandles = useRef<Record<number, number>>({});
  const [focusVersion, setFocusVersion] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const {
    reels,
    loading,
    loadingMore,
    hasMore,
    page,
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
    dispatch(fetchReels({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    dispatch(fetchReels({ page: page + 1, per_page: 10 }));
  };

  const handleLikeRef = (index: number, node: any) => {
    const handle = findNodeHandle(node);
    if (!handle || likeHandles.current[index] === handle) return;
    likeHandles.current[index] = handle;
    setFocusVersion(v => v + 1);
  };

  const handleLikeFocus = (index: number) => {
    if (index >= reels.length) return;
    if (index === focusedIndex) return;
    setFocusedIndex(index);
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
        onEndReachedThreshold={0.6}
        onEndReached={handleLoadMore}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : null
        }
        renderItem={({ item, index }) =>
          item.type === 'empty' ? (
            <View style={[styles.emptyScreen, { height }]}>
              <ReelEmpty />
            </View>
          ) : (
            <ReelCard
              reel={item.reel}
              index={index}
              preferredFocus={index === focusedIndex}
              nextFocusUp={likeHandles.current[index - 1]}
              nextFocusDown={likeHandles.current[index + 1]}
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
