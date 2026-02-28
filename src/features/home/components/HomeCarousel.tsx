import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  LayoutChangeEvent,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselItem } from './CarouselItem';
import { AppDispatch, RootState } from '../../../store';
import { fetchCarousels } from '../../../store/slice/home.slice';
import { Carousel } from '../../../types/home';

const HOME_SCREEN_HORIZONTAL_PADDING = 40;
const SPACING = 20;

export function HomeCarousel() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const currentIndexRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const fallbackWidth = Math.max(
    280,
    width - HOME_SCREEN_HORIZONTAL_PADDING,
  );

  const ITEM_WIDTH = Math.max(280, containerWidth || fallbackWidth);
  const ITEM_INTERVAL = ITEM_WIDTH + SPACING;

  const { carousels, loading } = useSelector(
    (state: RootState) => state.home
  );

  useEffect(() => {
    dispatch(fetchCarousels());
  }, [dispatch]);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (!nextWidth || nextWidth === containerWidth) {
      return;
    }
    setContainerWidth(nextWidth);
  };

  useEffect(() => {
    if (!carousels.length) return;
    currentIndexRef.current = Math.min(
      currentIndexRef.current,
      carousels.length - 1,
    );
  }, [carousels.length]);

  const initialScrollIndex =
    carousels.length > 0
      ? Math.min(currentIndexRef.current, carousels.length - 1)
      : 0;
  const listKey = `home-carousel-${Math.round(ITEM_INTERVAL)}`;
  const itemContainerStyle = useMemo(
    () => [styles.itemContainer, { width: ITEM_WIDTH }],
    [ITEM_WIDTH],
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      currentIndexRef.current = Math.round(
        event.nativeEvent.contentOffset.x / ITEM_INTERVAL,
      );
    },
    [ITEM_INTERVAL],
  );

  const renderItem = useCallback<ListRenderItem<Carousel>>(
    ({ item }) => (
      <View style={itemContainerStyle}>
        <CarouselItem item={item} />
      </View>
    ),
    [itemContainerStyle],
  );

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
        key={listKey}
        data={carousels}
        keyExtractor={(item) => item.id}
        initialScrollIndex={initialScrollIndex}
        horizontal
        snapToInterval={ITEM_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        bounces={false}
        removeClippedSubviews
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        updateCellsBatchingPeriod={16}
        extraData={ITEM_INTERVAL}
        getItemLayout={(_, index) => ({
          length: ITEM_INTERVAL,
          offset: ITEM_INTERVAL * index,
          index,
        })}
        onMomentumScrollEnd={handleMomentumEnd}
        ItemSeparatorComponent={Separator}
        renderItem={renderItem}
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
    width: 20,
  } as const,
  itemContainer: {
  } as const,
};
