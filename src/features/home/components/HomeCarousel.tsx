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
  const SPACING = 20;

  const ITEM_WIDTH = width - SIDEBAR_WIDTH - PADDING;

  const { carousels, loading } = useSelector(
    (state: RootState) => state.home
  );

  useEffect(() => {
    dispatch(fetchCarousels());
  }, []);

  if (loading) {
    return (
      <View
        style={{
          height: 300,
          justifyContent: 'center',
          alignItems: 'center',
        }}
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
      contentContainerStyle={{ paddingHorizontal: 20 }}
      ItemSeparatorComponent={() => <View style={{ width: SPACING }} />}
      renderItem={({ item }) => (
        <View style={{ width: ITEM_WIDTH }}>
          <CarouselItem item={item} />
        </View>
      )}
    />
  );
}
