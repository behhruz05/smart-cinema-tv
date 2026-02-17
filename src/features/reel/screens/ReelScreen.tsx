import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
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

  useEffect(() => {
    dispatch(fetchReels({ page: 1, per_page: 10 }));
  }, [dispatch]);

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
