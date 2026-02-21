import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { AppDispatch, RootState } from '../../../store';
import { ChannelCard } from '../components/ChannelCard';
import {
  fetchTvCategories,
  fetchTvChannelDetail,
  fetchTvChannels,
  fetchTvCurrentProgram,
  fetchTvUpcomingPrograms,
  setSelectedCategoryId,
  setSelectedChannelId,
} from '../../../store/slice/tv.slice';
import { TvCategory, TvProgram } from '../../../types/tv';

function formatProgramTime(dateValue: string) {
  const date = new Date(dateValue);
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mm}`;
}

function getDayChips() {
  const labels = ['today', 'tomorrow'];
  const now = new Date();
  const chips: { key: string; label: string }[] = [
    { key: 'today', label: labels[0] },
    { key: 'tomorrow', label: labels[1] },
  ];

  for (let i = 0; i < 4; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    chips.push({
      key: `date-${i}`,
      label: `${day.getDate()}.${day.getMonth() + 1}.${day.getFullYear()}`,
    });
  }

  return chips;
}

export function TvChannelsScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isTV = Platform.isTV;
  const [focusedCategoryId, setFocusedCategoryId] = useState<
    string | null
  >(null);
  const [focusedChannelId, setFocusedChannelId] = useState<string | null>(
    null,
  );
  const [selectedDayKey, setSelectedDayKey] = useState('today');
  const [focusedDayKey, setFocusedDayKey] = useState<string | null>(null);

  const {
    categories,
    channels,
    selectedCategoryId,
    selectedChannelId,
    channelDetail,
    currentProgram,
    upcomingPrograms,
    categoriesStatus,
    channelsStatus,
    detailStatus,
  } = useSelector((state: RootState) => state.tv);

  const lang = i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';

  useEffect(() => {
    dispatch(fetchTvCategories(lang));
  }, [dispatch, lang]);

  useEffect(() => {
    dispatch(
      fetchTvChannels({
        lang,
        page: 1,
        per_page: 20,
        categoryId: selectedCategoryId,
      }),
    );
  }, [dispatch, lang, selectedCategoryId]);

  useEffect(() => {
    if (!channels.length) return;
    if (selectedChannelId) return;
    dispatch(setSelectedChannelId(channels[0].id));
  }, [channels, dispatch, selectedChannelId]);

  useEffect(() => {
    if (!selectedChannelId) return;
    dispatch(
      fetchTvChannelDetail({
        lang,
        channelId: selectedChannelId,
      }),
    );
    dispatch(
      fetchTvCurrentProgram({
        lang,
        channelId: selectedChannelId,
      }),
    );
    dispatch(
      fetchTvUpcomingPrograms({
        lang,
        channelId: selectedChannelId,
        limit: 10,
      }),
    );
  }, [dispatch, lang, selectedChannelId]);

  const allCategory: TvCategory = useMemo(
    () => ({
      id: 'all',
      name: t('tv_channels.all'),
      slug: 'all',
    }),
    [t],
  );

  const categoryItems = useMemo(
    () => [allCategory, ...categories],
    [allCategory, categories],
  );

  const dayChips = useMemo(() => getDayChips(), []);
  const programsToRender: TvProgram[] = useMemo(() => {
    const list: TvProgram[] = [];
    if (currentProgram) list.push(currentProgram);
    return [...list, ...upcomingPrograms];
  }, [currentProgram, upcomingPrograms]);

  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.categoriesColumn}>
          {categoriesStatus === 'loading' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            categoryItems.map((category, index) => {
              const active =
                category.id === 'all'
                  ? !selectedCategoryId
                  : selectedCategoryId === category.id;
              const focused = focusedCategoryId === category.id;

              return (
                <Pressable
                  key={category.id}
                  focusable={isTV}
                  hasTVPreferredFocus={index === 0 && isTV}
                  onFocus={() => setFocusedCategoryId(category.id)}
                  onBlur={() => setFocusedCategoryId(null)}
                  onPress={() => {
                    dispatch(
                      setSelectedCategoryId(
                        category.id === 'all' ? null : category.id,
                      ),
                    );
                    dispatch(setSelectedChannelId(null));
                  }}
                  style={[
                    styles.categoryItem,
                    active && styles.categoryItemActive,
                    focused && styles.categoryItemFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.channelsColumn}>
          {channelsStatus === 'loading' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <FlatList
              data={channels}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <ChannelCard
                  channel={item}
                  active={selectedChannelId === item.id}
                  focused={focusedChannelId === item.id}
                  onFocus={() => setFocusedChannelId(item.id)}
                  onBlur={() => setFocusedChannelId(null)}
                  onPress={() => dispatch(setSelectedChannelId(item.id))}
                  isTV={isTV}
                  preferredFocus={index === 0 && !selectedChannelId}
                />
              )}
            />
          )}
        </View>

        <View style={styles.detailsColumn}>
          {detailStatus === 'loading' || !channelDetail ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <>
              <View style={styles.previewCard}>
                <Image
                  source={{ uri: channelDetail.logo_url }}
                  style={styles.previewLogo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.sectionTitle}>
                {t('tv_channels.schedule')}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dayScroll}
              >
                {dayChips.map(chip => {
                  const active = selectedDayKey === chip.key;
                  const focused = focusedDayKey === chip.key;
                  return (
                    <Pressable
                      key={chip.key}
                      focusable={isTV}
                      onFocus={() => setFocusedDayKey(chip.key)}
                      onBlur={() => setFocusedDayKey(null)}
                      onPress={() => setSelectedDayKey(chip.key)}
                      style={[
                        styles.dayChip,
                        active && styles.dayChipActive,
                        focused && styles.dayChipFocused,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          active && styles.dayChipTextActive,
                        ]}
                      >
                        {chip.label === 'today'
                          ? t('tv_channels.today')
                          : chip.label === 'tomorrow'
                            ? t('tv_channels.tomorrow')
                            : chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <ScrollView style={styles.timeline}>
                {programsToRender.map((program, index) => (
                  <View key={program.id} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTime}>
                        {formatProgramTime(program.starts_at)} - {formatProgramTime(program.ends_at)}
                      </Text>
                      <Text style={styles.timelineTitle}>{program.title}</Text>
                      {index === 0 && (
                        <View style={styles.liveBadge}>
                          <Text style={styles.liveText}>
                            {t('tv_channels.live')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  categoriesColumn: {
    width: 150,
    paddingTop: 2,
  },
  categoryItem: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#fff',
  },
  categoryItemFocused: {
    borderColor: '#ffffff',
  },
  categoryText: {
    color: '#d1d5db',
    fontSize: 13,
  },
  categoryTextActive: {
    color: '#111111',
    fontWeight: '600',
  },
  channelsColumn: {
    width: 126,
  },
  detailsColumn: {
    flex: 1,
    backgroundColor: '#101010',
    borderRadius: 14,
    padding: 14,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    height: 226,
    borderRadius: 12,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  previewLogo: {
    width: '92%',
    height: '84%',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  dayScroll: {
    marginBottom: 10,
    maxHeight: 40,
  },
  dayChip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1b1b1b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayChipActive: {
    backgroundColor: '#fff',
  },
  dayChipFocused: {
    borderColor: '#ffffff',
  },
  dayChipText: {
    color: '#c9c9c9',
    fontSize: 12,
  },
  dayChipTextActive: {
    color: '#111',
    fontWeight: '600',
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
    backgroundColor: '#6b7280',
  },
  timelineContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#2b2b2b',
    paddingLeft: 10,
    paddingBottom: 2,
  },
  timelineTime: {
    color: '#7f7f7f',
    fontSize: 11,
    marginBottom: 2,
  },
  timelineTitle: {
    color: '#ececec',
    fontSize: 15,
    marginBottom: 4,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
