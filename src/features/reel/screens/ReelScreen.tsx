import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchReels } from '../../../store/slice/reel.slice';
import { ReelLoader } from '../components/ReelLoader';
import { ReelCard } from '../components/ReelCard';

const { height } = Dimensions.get('window');

export function ReelScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { reels, loading } = useSelector(
    (state: RootState) => state.reel
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchReels({ page: 1, per_page: 10 }));
  }, [dispatch]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.y / height
    );
    setCurrentIndex(index);
  };

  if (loading && !reels.length) {
    return <ReelLoader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        renderItem={({ item }) => (
          <ReelCard reel={item} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
});
