import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselItem } from './CarouselItem';
import { AppDispatch, RootState } from '../../../store';
import { fetchCarousels } from '../../../store/slice/home.slice';
import { Carousel } from '../../../types/home';

export function HomeCarousel() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Carousel>>(null);
  const currentIndexRef = useRef(0);
  const itemIntervalRef = useRef(0);
  const realignTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const SPACING = 22;
  const HOME_SCREEN_HORIZONTAL_PADDING = 40;
  const fallbackWidth = Math.max(
    280,
    width - HOME_SCREEN_HORIZONTAL_PADDING,
  );

  const ITEM_WIDTH = Math.max(280, containerWidth || fallbackWidth);
  const ITEM_INTERVAL = ITEM_WIDTH + SPACING;
  itemIntervalRef.current = ITEM_INTERVAL;

  const { carousels, loading } = useSelector(
    (state: RootState) => state.home
  );

  useEffect(() => {
    dispatch(fetchCarousels());
  }, [dispatch]);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth && nextWidth !== containerWidth) {
      setContainerWidth(nextWidth);
    }
  };

  useEffect(() => {
    if (!carousels.length) return;
    const safeIndex = Math.min(
      currentIndexRef.current,
      Math.max(0, carousels.length - 1),
    );
    currentIndexRef.current = safeIndex;

    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: safeIndex * itemIntervalRef.current,
        animated: false,
      });
    });
  }, [carousels.length]);

  useEffect(() => {
    if (!carousels.length) return;

    if (realignTimeoutRef.current) {
      clearTimeout(realignTimeoutRef.current);
    }

    realignTimeoutRef.current = setTimeout(() => {
      const safeIndex = Math.min(
        currentIndexRef.current,
        Math.max(0, carousels.length - 1),
      );
      currentIndexRef.current = safeIndex;
      listRef.current?.scrollToOffset({
        offset: safeIndex * ITEM_INTERVAL,
        animated: false,
      });
    }, 280);

    return () => {
      if (realignTimeoutRef.current) {
        clearTimeout(realignTimeoutRef.current);
        realignTimeoutRef.current = null;
      }
    };
  }, [ITEM_INTERVAL, carousels.length]);

  if (loading) {
    return (
      <View
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <FlatList
        ref={listRef}
        data={carousels}
        keyExtractor={(item) => item.id}
        horizontal
        snapToInterval={ITEM_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: ITEM_INTERVAL,
          offset: ITEM_INTERVAL * index,
          index,
        })}
        onMomentumScrollEnd={event => {
          currentIndexRef.current = Math.round(
            event.nativeEvent.contentOffset.x / itemIntervalRef.current,
          );
        }}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
            <CarouselItem item={item} />
          </View>
        )}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = {
  container: {
    width: '100%',
    alignSelf: 'stretch',
  } as const,
  loaderContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  separator: {
    width: 22,
  } as const,
  itemContainer: {
  } as const,
};
