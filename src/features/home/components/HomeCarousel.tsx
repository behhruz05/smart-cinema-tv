import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CarouselItem } from './CarouselItem';
import { AppDispatch, RootState } from '../../../store';
import { fetchCarousels } from '../../../store/slice/home.slice';

export function HomeCarousel() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();

  const isSidebarOpen = useSelector(
    (state: RootState) => state.ui.isSidebarOpen
  );

  const SIDEBAR_WIDTH = isSidebarOpen ? 220 : 90;

  const PADDING = 40;
  const SPACING = 22;

  const ITEM_WIDTH = width - SIDEBAR_WIDTH - PADDING;

  const { carousels, loading } = useSelector(
    (state: RootState) => state.home
  );

  useEffect(() => {
    dispatch(fetchCarousels());
  }, [dispatch]);

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
    <FlatList
      data={carousels}
      keyExtractor={(item) => item.id}
      horizontal
      snapToInterval={ITEM_WIDTH + SPACING}
      snapToAlignment="start"
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      bounces={false}
      ItemSeparatorComponent={Separator}
      renderItem={({ item }) => (
        <View style={[styles.itemContainer, { width: ITEM_WIDTH }]}>
          <CarouselItem item={item} />
        </View>
      )}
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = {
  loaderContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  } as const,
  separator: {
    width: 22,
  } as const,
  itemContainer: {
    // Width is set dynamically from screen size.
  } as const,
};
