import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
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

const SPACING = 20;
const AUTO_ROTATE_INTERVAL_MS = 3000;
const DOUBLE_PRESS_WINDOW_MS = 320;
const ITEM_EDGE_SAFE_GAP = 12;
const SIDEBAR_COLLAPSED_TOTAL_INSET = 102;
const SIDEBAR_EXPANDED_TOTAL_INSET = 212;
const PROGRAMMATIC_SCROLL_SETTLE_MS = 360;
const PENDING_WIDTH_FLUSH_MS = 520;

export function HomeCarousel() {
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowDimensions();
  const isTV = Platform.isTV;
  const currentIndexRef = useRef(0);
  const listRef = useRef<FlatList<Carousel> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingWidthFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHorizontalScrollActiveRef = useRef(false);
  const pendingViewportWidthRef = useRef<number | null>(null);
  const lastMeasuredViewportWidthRef = useRef<number>(0);
  const lastDirectionalPressRef = useRef<{ dir: 'left' | 'right'; at: number } | null>(null);
  const focusedActionIndexRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [preferredFocusIndex, setPreferredFocusIndex] = useState<number | null>(null);

  const { carousels, loading } = useSelector(
    (state: RootState) => state.home
  );
  const isSidebarOpen = useSelector(
    (state: RootState) => state.ui.isSidebarOpen,
  );

  const computeViewportWidth = useCallback(
    (screenWidth: number, sidebarOpen: boolean) =>
      Math.max(
        280,
        screenWidth - (sidebarOpen ? SIDEBAR_EXPANDED_TOTAL_INSET : SIDEBAR_COLLAPSED_TOTAL_INSET),
      ),
    [],
  );

  const [viewportWidth, setViewportWidth] = useState(() =>
    computeViewportWidth(width, isSidebarOpen),
  );
  const ITEM_WIDTH = Math.max(280, viewportWidth - ITEM_EDGE_SAFE_GAP);
  const ITEM_INTERVAL = ITEM_WIDTH + SPACING;

  const flushPendingViewportWidth = useCallback(() => {
    const pending = pendingViewportWidthRef.current;
    pendingViewportWidthRef.current = null;
    if (pending === null) return;
    if (Math.abs(pending - viewportWidth) < 2) return;
    isHorizontalScrollActiveRef.current = false;
    setViewportWidth(pending);
  }, [viewportWidth]);

  const queuePendingViewportWidth = useCallback((nextWidth: number) => {
    pendingViewportWidthRef.current = nextWidth;
    if (pendingWidthFlushTimerRef.current) {
      clearTimeout(pendingWidthFlushTimerRef.current);
    }
    // Watchdog: avoid width being stuck when scroll-end callbacks don't fire.
    pendingWidthFlushTimerRef.current = setTimeout(() => {
      flushPendingViewportWidth();
    }, PENDING_WIDTH_FLUSH_MS);
  }, [flushPendingViewportWidth]);

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredWidth = Math.round(event.nativeEvent.layout.width);
    if (!measuredWidth || measuredWidth < 280) return;
    lastMeasuredViewportWidthRef.current = measuredWidth;

    if (Math.abs(measuredWidth - viewportWidth) < 2) return;
    if (isHorizontalScrollActiveRef.current) {
      queuePendingViewportWidth(measuredWidth);
      return;
    }
    setViewportWidth(measuredWidth);
  }, [queuePendingViewportWidth, viewportWidth]);

  useEffect(() => {
    dispatch(fetchCarousels());
  }, [dispatch]);

  useEffect(() => {
    if (lastMeasuredViewportWidthRef.current > 0) {
      // Prefer real measured width once available.
      return;
    }
    const nextViewportWidth = computeViewportWidth(width, isSidebarOpen);
    if (Math.abs(nextViewportWidth - viewportWidth) < 2) {
      return;
    }

    if (isHorizontalScrollActiveRef.current) {
      queuePendingViewportWidth(nextViewportWidth);
      return;
    }

    setViewportWidth(nextViewportWidth);
  }, [computeViewportWidth, isSidebarOpen, queuePendingViewportWidth, viewportWidth, width]);

  useEffect(() => {
    if (!carousels.length) return;
    const bounded = Math.min(activeIndex, carousels.length - 1);
    if (bounded !== activeIndex) {
      setActiveIndex(bounded);
    }
    currentIndexRef.current = Math.min(
      currentIndexRef.current,
      carousels.length - 1,
    );
  }, [activeIndex, carousels.length]);

  const initialScrollIndex =
    carousels.length > 0
      ? Math.min(activeIndex, carousels.length - 1)
      : 0;
  const itemContainerStyle = useMemo(
    () => [styles.itemContainer, { width: ITEM_WIDTH }],
    [ITEM_WIDTH],
  );

  useEffect(() => {
    if (!carousels.length) return;
    const safeIndex = Math.max(
      0,
      Math.min(currentIndexRef.current, carousels.length - 1),
    );
    listRef.current?.scrollToOffset({
      offset: safeIndex * ITEM_INTERVAL,
      animated: false,
    });
  }, [ITEM_INTERVAL, carousels.length]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / ITEM_INTERVAL,
      );
      isHorizontalScrollActiveRef.current = false;
      currentIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      const pending = pendingViewportWidthRef.current;
      pendingViewportWidthRef.current = null;
      if (pending !== null) {
        setViewportWidth(pending);
      }
    },
    [ITEM_INTERVAL],
  );

  const scrollToIndex = useCallback(
    (index: number, options?: { preserveFocus?: boolean }) => {
      if (!carousels.length) return;
      const next = Math.max(0, Math.min(index, carousels.length - 1));
      isHorizontalScrollActiveRef.current = true;
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current);
      }
      scrollSettleTimerRef.current = setTimeout(() => {
        isHorizontalScrollActiveRef.current = false;
        flushPendingViewportWidth();
      }, PROGRAMMATIC_SCROLL_SETTLE_MS);
      currentIndexRef.current = next;
      setActiveIndex(next);
      setPreferredFocusIndex(options?.preserveFocus ? next : null);
      listRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    },
    [carousels.length],
  );

  const markCarouselFocused = useCallback((itemIndex: number) => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    focusedActionIndexRef.current = itemIndex;
  }, []);

  const markCarouselBlurred = useCallback((itemIndex: number) => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
    }
    blurTimerRef.current = setTimeout(() => {
      if (focusedActionIndexRef.current === itemIndex) {
        focusedActionIndexRef.current = null;
      }
    }, 120);
  }, []);

  const handleDirectionalPress = useCallback(
    (direction: 'left' | 'right', sourceIndex?: number) => {
      const now = Date.now();
      const previous = lastDirectionalPressRef.current;
      const isDoubleTap =
        previous &&
        previous.dir === direction &&
        now - previous.at <= DOUBLE_PRESS_WINDOW_MS;

      lastDirectionalPressRef.current = { dir: direction, at: now };
      if (!isDoubleTap) return;

      const baseIndex =
        typeof sourceIndex === 'number'
          ? sourceIndex
          : typeof focusedActionIndexRef.current === 'number'
            ? focusedActionIndexRef.current
            : currentIndexRef.current;

      scrollToIndex(
        baseIndex + (direction === 'right' ? 1 : -1),
        { preserveFocus: true },
      );
    },
    [scrollToIndex],
  );

  const handleEdgeNavigate = useCallback(
    (direction: 'left' | 'right', sourceIndex: number) => {
      scrollToIndex(
        sourceIndex + (direction === 'right' ? 1 : -1),
        { preserveFocus: true },
      );
    },
    [scrollToIndex],
  );

  const handleTVEvent = useCallback(
    (event: { eventType?: string; keyCode?: number }) => {
      if (!isTV || focusedActionIndexRef.current === null) return;

      const normalized = String(event?.eventType || '')
        .toLowerCase()
        .trim();
      const keyCode = event?.keyCode;
      const direction =
        normalized === 'left' ||
        normalized === 'arrowleft' ||
        normalized === 'dpadleft' ||
        normalized === 'swipeleft' ||
        normalized === 'rewind' ||
        keyCode === 21 ||
        keyCode === 37
          ? 'left'
          : normalized === 'right' ||
              normalized === 'arrowright' ||
              normalized === 'dpadright' ||
              normalized === 'swiperight' ||
              normalized === 'fastforward' ||
              keyCode === 22 ||
              keyCode === 39
            ? 'right'
            : null;

      if (!direction) return;
      handleDirectionalPress(direction, focusedActionIndexRef.current ?? undefined);
    },
    [handleDirectionalPress, isTV],
  );

  useEffect(() => {
    if (!carousels.length || carousels.length < 2) return;
    const intervalId = setInterval(() => {
      if (focusedActionIndexRef.current !== null) return;
      const nextIndex =
        currentIndexRef.current >= carousels.length - 1
          ? 0
          : currentIndexRef.current + 1;
      scrollToIndex(nextIndex, { preserveFocus: false });
    }, AUTO_ROTATE_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [carousels.length, scrollToIndex]);

  useEffect(() => {
    return () => {
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current);
      }
      if (pendingWidthFlushTimerRef.current) {
        clearTimeout(pendingWidthFlushTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isTV) return;
    let tvEventSubscription: any = null;

    try {
      const rnModule = require('react-native');
      const TVHandler = rnModule?.TVEventHandler;
      if (!TVHandler) return;
      const tvEventHandler = new TVHandler();
      tvEventSubscription = tvEventHandler;
      tvEventHandler.enable?.(undefined, (_: any, event: any) => {
        handleTVEvent(event);
      });
    } catch {
      // no-op when TV event handler is unavailable
    }

    return () => {
      tvEventSubscription?.disable?.();
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current);
      }
      if (pendingWidthFlushTimerRef.current) {
        clearTimeout(pendingWidthFlushTimerRef.current);
      }
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, [handleTVEvent, isTV]);

  const renderItem = useCallback<ListRenderItem<Carousel>>(
    ({ item, index }) => (
      <View style={itemContainerStyle}>
        <CarouselItem
          item={item}
          itemIndex={index}
          preferredFocus={isTV && preferredFocusIndex === index}
          onActionFocus={markCarouselFocused}
          onActionBlur={markCarouselBlurred}
          onDirectionalPress={handleDirectionalPress}
          onEdgeNavigate={handleEdgeNavigate}
        />
      </View>
    ),
    [
      handleEdgeNavigate,
      handleDirectionalPress,
      isTV,
      itemContainerStyle,
      markCarouselBlurred,
      markCarouselFocused,
      preferredFocusIndex,
    ],
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
        ref={listRef}
        data={carousels}
        keyExtractor={(item) => item.id}
        initialScrollIndex={initialScrollIndex}
        horizontal
        scrollEnabled={!isTV}
        contentContainerStyle={styles.listContent}
        snapToInterval={ITEM_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        bounces={false}
        removeClippedSubviews={false}
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
        onScrollBeginDrag={() => {
          isHorizontalScrollActiveRef.current = true;
        }}
        onMomentumScrollBegin={() => {
          isHorizontalScrollActiveRef.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={() => {
          if (!isHorizontalScrollActiveRef.current) return;
          if (scrollSettleTimerRef.current) {
            clearTimeout(scrollSettleTimerRef.current);
          }
          scrollSettleTimerRef.current = setTimeout(() => {
            isHorizontalScrollActiveRef.current = false;
            flushPendingViewportWidth();
          }, 120);
        }}
        ItemSeparatorComponent={Separator}
        renderItem={renderItem}
        onScrollToIndexFailed={(info) => {
          const safeIndex = Math.max(0, Math.min(info.index, carousels.length - 1));
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: safeIndex,
              animated: true,
            });
          }, 60);
        }}
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
  listContent: {
    paddingRight: ITEM_EDGE_SAFE_GAP,
  } as const,
};
