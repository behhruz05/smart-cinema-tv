import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../../types/navigations';
import { tvService } from '../../../service/tv.service';
import { TvProgram } from '../../../types/tv';
import { tokenStorage } from '../../../shared/lib/tokenStorage';
import { getAppLanguage } from '../../../i18n';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { PauseIcon } from '../../../shared/icons/PauseIcon';
import { SettingsIcon } from '../../../shared/icons/SettingIcon';
import { TvIcon } from '../../../shared/icons/TvIcon';
import { CloseXIcon } from '../../../shared/icons/CloseXIcon';
import { WifiOffIcon } from '../../../shared/icons/WifiOffIcon';
import { WifiCheckIcon } from '../../../shared/icons/WifiCheckIcon';
import { ScheduleIcon } from '../../../shared/icons/ScheduleIcon';

type TvPlayerRouteProp = RouteProp<RootStackParamList, 'TvPlayer'>;
type TvPlayerNavProp = NativeStackNavigationProp<RootStackParamList>;

const CONTROLS_HIDE_MS = 5000;
const QUALITY_OPTIONS = ['Авто', '4K', '2K', '1080HD', '720'];
const SUBTITLE_SIZE_OPTIONS = ['Стандартный', 'Мягкий', 'Крупный'];

type FocusedControl = null | 'close' | 'play' | 'schedule' | 'tv' | 'settings';

// Pastki qator tartib: play → schedule → tv → settings
const BOTTOM_ROW: FocusedControl[] = ['play', 'schedule', 'tv', 'settings'];

function getVideoComponent(): React.ComponentType<any> | null {
  try {
    const m = require('react-native-video');
    return (m?.default || m) as React.ComponentType<any>;
  } catch {
    return null;
  }
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function getClockString(): string {
  const now = new Date();
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const months = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
  ];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}. ${hh}:${mm}`;
}

interface DateChip {
  key: string;
  label: string;
  startIso: string;
  endIso: string;
}

function buildDateChips(todayLabel: string, tomorrowLabel: string): DateChip[] {
  const chips: DateChip[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const dd = String(day.getDate()).padStart(2, '0');
    const mo = String(day.getMonth() + 1).padStart(2, '0');
    const yyyy = day.getFullYear();
    chips.push({
      key: String(i),
      label:
        i === 0 ? todayLabel : i === 1 ? tomorrowLabel : `${dd}.${mo}.${yyyy}`,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    });
  }
  return chips;
}

function formatProgramTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function isCurrentProgram(program: TvProgram): boolean {
  const now = Date.now();
  return (
    new Date(program.starts_at).getTime() <= now &&
    now < new Date(program.ends_at).getTime()
  );
}

function computeLiveProgress(program: TvProgram | null): number {
  if (!program) return 1;
  const now = Date.now();
  const start = new Date(program.starts_at).getTime();
  const end = new Date(program.ends_at).getTime();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

function computeLiveElapsed(program: TvProgram | null): string {
  if (!program) return '00:00';
  return formatTime(Math.max(0, (Date.now() - new Date(program.starts_at).getTime()) / 1000));
}

function computeProgramDuration(program: TvProgram | null): string {
  if (!program) return '00:00';
  const dur = Math.max(0, (new Date(program.ends_at).getTime() - new Date(program.starts_at).getTime()) / 1000);
  return formatTime(dur);
}

export function TvPlayerScreen() {
  const { t } = useTranslation();
  const route = useRoute<TvPlayerRouteProp>();
  const navigation = useNavigation<TvPlayerNavProp>();
  const { channelId, streamUrl, channelName, currentProgramTitle } = route.params;

  const isTV = useMemo(() => {
    const c = (Platform as any)?.constants || {};
    return Boolean(
      Platform.isTV ||
        (Platform as any).isTVOS ||
        String(c.uiMode || '').toLowerCase() === 'tv',
    );
  }, []);

  const VideoEl = useMemo(() => getVideoComponent(), []) as any;
  const lang = getAppLanguage() as 'uz' | 'ru' | 'en';

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevOnlineRef = useRef(true);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [epgVisible, setEpgVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [videoBuffering, setVideoBuffering] = useState(true);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [clockStr, setClockStr] = useState(getClockString);
  const [networkStatus, setNetworkStatus] = useState<'offline' | 'restored' | null>(null);

  const [currentProgram, setCurrentProgram] = useState<TvProgram | null>(null);
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveElapsed, setLiveElapsed] = useState('00:00');
  const [liveDuration, setLiveDuration] = useState('00:00');

  const [dateChips, setDateChips] = useState<DateChip[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState('0');
  const [epgPrograms, setEpgPrograms] = useState<TvProgram[]>([]);
  const [epgLoading, setEpgLoading] = useState(false);

  const [quality, setQuality] = useState('Авто');
  const [subtitleSize, setSubtitleSize] = useState('Стандартный');
  const [audioLang, setAudioLang] = useState('Русский');
  const [focusedControl, setFocusedControl] = useState<FocusedControl>(null);
  const focusedControlRef = useRef<FocusedControl>(null);

  useEffect(() => {
    focusedControlRef.current = focusedControl;
  }, [focusedControl]);

  useEffect(() => {
    tokenStorage.get().then(setAuthToken);
  }, []);

  useEffect(() => {
    setDateChips(buildDateChips(t('tv_channels.today'), t('tv_channels.tomorrow')));
  }, [t]);

  // 1-soniyalik clock + live progress ticker
  useEffect(() => {
    const id = setInterval(() => {
      setClockStr(getClockString());
      setLiveProgress(computeLiveProgress(currentProgram));
      setLiveElapsed(computeLiveElapsed(currentProgram));
      setLiveDuration(computeProgramDuration(currentProgram));
    }, 1000);
    return () => clearInterval(id);
  }, [currentProgram]);

  // Joriy dasturni yuklash
  useEffect(() => {
    tvService
      .getChannelCurrentProgram(channelId, lang)
      .then(res => setCurrentProgram(res.data))
      .catch(() => {});
  }, [channelId, lang]);

  // Internet tekshirish (6 soniyada bir)
  useEffect(() => {
    const check = async () => {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        await fetch('https://api.alloplay.uz/api/v1', { method: 'HEAD', signal: ctrl.signal });
        clearTimeout(timer);
        if (!prevOnlineRef.current) {
          prevOnlineRef.current = true;
          setNetworkStatus('restored');
          setTimeout(() => setNetworkStatus(null), 3000);
        }
      } catch {
        if (prevOnlineRef.current) {
          prevOnlineRef.current = false;
          setNetworkStatus('offline');
        }
      }
    };
    const id = setInterval(check, 6000);
    return () => clearInterval(id);
  }, []);

  // EPG yuklash
  useEffect(() => {
    if (!dateChips.length) return;
    const chip = dateChips.find(c => c.key === selectedDayKey);
    if (!chip) return;
    setEpgLoading(true);
    tvService
      .getChannelEpg(channelId, chip.startIso, chip.endIso, lang)
      .then(res => setEpgPrograms(res.data))
      .catch(() => setEpgPrograms([]))
      .finally(() => setEpgLoading(false));
  }, [channelId, selectedDayKey, dateChips, lang]);

  const pingControls = useCallback((initialFocus?: FocusedControl) => {
    setControlsVisible(true);
    if (initialFocus !== undefined) {
      setFocusedControl(initialFocus);
    } else if (!focusedControlRef.current) {
      setFocusedControl('play');
    }
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      setSettingsVisible(false);
      setFocusedControl(null);
    }, CONTROLS_HIDE_MS);
  }, []);

  const toggleEpg = useCallback(() => {
    setEpgVisible(v => !v);
    setSettingsVisible(false);
    pingControls();
  }, [pingControls]);

  const toggleSettings = useCallback(() => {
    setSettingsVisible(v => !v);
    setEpgVisible(false);
    pingControls();
  }, [pingControls]);

  // TV remote (D-pad) boshqaruvi
  const handleTVEvent = useCallback(
    (event: { eventType?: string; keyCode?: number }) => {
      const kc = event?.keyCode;
      const et = String(event?.eventType || '').toLowerCase();

      const isBack    = kc === 4   || kc === 111 || et.includes('back')   || et.includes('menu');
      const isEnter   = kc === 23  || kc === 66  || et.includes('select') || et.includes('enter');
      const isLeft    = kc === 21  || kc === 37  || et === 'left'  || et === 'arrowleft'  || et === 'dpadleft';
      const isRight   = kc === 22  || kc === 39  || et === 'right' || et === 'arrowright' || et === 'dpadright';
      const isUp      = kc === 19  || kc === 38  || et === 'up'    || et === 'arrowup'    || et === 'dpadup';
      const isDown    = kc === 20  || kc === 40  || et === 'down'  || et === 'arrowdown'  || et === 'dpaddown';

      // BACK — panellarni yopish yoki chiqish
      if (isBack) {
        if (epgVisible)      { setEpgVisible(false);      return; }
        if (settingsVisible) { setSettingsVisible(false); return; }
        navigation.goBack();
        return;
      }

      // Controls yashirin — istalgan tugma controls ni ko'rsatsin
      if (!controlsVisible) {
        pingControls('play');
        return;
      }

      // Joriy focus
      const cur = focusedControlRef.current;

      // UP — pastki qatordan tepaga (close)
      if (isUp) {
        if (cur !== 'close') {
          setFocusedControl('close');
          pingControls('close');
        }
        return;
      }

      // DOWN — tepadan pastki qatorga
      if (isDown) {
        if (cur === 'close' || cur === null) {
          setFocusedControl('play');
          pingControls('play');
        }
        return;
      }

      // LEFT — pastki qatorda chapga
      if (isLeft) {
        const idx = BOTTOM_ROW.indexOf(cur as any);
        if (idx > 0) {
          const next = BOTTOM_ROW[idx - 1];
          setFocusedControl(next);
          pingControls(next);
        }
        return;
      }

      // RIGHT — pastki qatorda o'ngga
      if (isRight) {
        const idx = BOTTOM_ROW.indexOf(cur as any);
        if (idx >= 0 && idx < BOTTOM_ROW.length - 1) {
          const next = BOTTOM_ROW[idx + 1];
          setFocusedControl(next);
          pingControls(next);
        }
        return;
      }

      // ENTER — fokusda turgan tugmani bosish
      if (isEnter) {
        pingControls();
        switch (cur) {
          case 'close':    navigation.goBack(); break;
          case 'play':     setIsPaused(p => !p); break;
          case 'schedule': toggleEpg(); break;
          case 'tv':       navigation.goBack(); break;
          case 'settings': toggleSettings(); break;
          default:         setIsPaused(p => !p); break;
        }
        return;
      }

      pingControls();
    },
    [
      controlsVisible,
      epgVisible,
      navigation,
      pingControls,
      settingsVisible,
      toggleEpg,
      toggleSettings,
    ],
  );

  useEffect(() => {
    if (!isTV) return;
    let handler: any = null;
    try {
      const { TVEventHandler } = require('react-native');
      if (!TVEventHandler) return;
      handler = new TVEventHandler();
      handler.enable?.(undefined, (_: any, e: any) => handleTVEvent(e));
    } catch {}
    return () => handler?.disable?.();
  }, [handleTVEvent, isTV]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = DeviceEventEmitter.addListener('TV_REMOTE_KEY', (p: any) => {
      handleTVEvent({ eventType: p?.keyName, keyCode: p?.keyCode });
    });
    return () => sub.remove();
  }, [handleTVEvent]);

  useEffect(() => {
    pingControls();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pingControls]);

  const hasVideo = Boolean(streamUrl && /^https?:\/\//i.test(streamUrl));
  const displayTitle = currentProgramTitle || currentProgram?.title || '';

  return (
    <View style={styles.screen}>
      {/* VIDEO */}
      {VideoEl && hasVideo ? (
        <VideoEl
          source={{
            uri: streamUrl,
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
              'Accept-Language': lang,
            },
          }}
          paused={isPaused}
          resizeMode="cover"
          onLoadStart={() => { setVideoBuffering(true); setFirstFrameReady(false); }}
          onLoad={() => { setVideoBuffering(false); setFirstFrameReady(true); setStreamError(null); }}
          onReadyForDisplay={() => { setVideoBuffering(false); setFirstFrameReady(true); setStreamError(null); }}
          onBuffer={({ isBuffering }: { isBuffering: boolean }) => setVideoBuffering(Boolean(isBuffering))}
          onError={() => { setVideoBuffering(false); setStreamError(t('player.stream_unavailable')); }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.posterFallback]} />
      )}

      {/* GRADIENT ustki */}
      <LinearGradient
        colors={['rgba(0,0,0,0.72)', 'transparent']}
        style={styles.gradientTop}
        pointerEvents="none"
      />
      {/* GRADIENT pastki */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradientBottom}
        pointerEvents="none"
      />

      {/* BUFFERING */}
      {!firstFrameReady && videoBuffering && !streamError && (
        <View style={styles.bufferOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {/* XATO */}
      {streamError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{streamError}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => { setStreamError(null); setVideoBuffering(true); setFirstFrameReady(false); }}>
            <Text style={styles.retryText}>{t('player.retry')}</Text>
          </Pressable>
        </View>
      )}

      {/* NETWORK TOAST */}
      {networkStatus !== null && (
        <View
          style={[
            styles.networkToast,
            networkStatus === 'offline' ? styles.toastOffline : styles.toastOnline,
          ]}
          pointerEvents="none">
          {networkStatus === 'offline'
            ? <WifiOffIcon size={16} color="#fff" />
            : <WifiCheckIcon size={16} color="#fff" />}
          <Text style={styles.toastText}>
            {networkStatus === 'offline'
              ? 'Нет интернет соединения'
              : 'Интернет соединение восстановлено'}
          </Text>
        </View>
      )}

      {/* TOUCH ZONE - controls ko'rinishi uchun */}
      <Pressable
        focusable={false}
        onPress={() => pingControls()}
        style={StyleSheet.absoluteFill}
      />

      {/* TOP ROW */}
      {controlsVisible && !streamError && (
        <View style={styles.topRow} pointerEvents="box-none">
          <Pressable
            focusable={isTV}
            onFocus={() => { setFocusedControl('close'); pingControls('close'); }}
            onBlur={() => setFocusedControl(null)}
            onPress={() => navigation.goBack()}
            style={[styles.closeBtn, focusedControl === 'close' && styles.btnFocused]}>
            <CloseXIcon size={18} color="#fff" />
          </Pressable>

          <View style={styles.topCenter}>
            <Text style={styles.topChannelName} numberOfLines={1}>
              {channelName}
            </Text>
            {!!displayTitle && (
              <Text style={styles.topProgramName} numberOfLines={1}>
                {displayTitle}
              </Text>
            )}
          </View>

          <View style={styles.topRight}>
            <Text style={styles.clockText}>{clockStr}</Text>
          </View>
        </View>
      )}

      {/* BOTTOM BAR */}
      {controlsVisible && !streamError && (
        <View style={styles.bottomWrap} pointerEvents="box-none">
          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${liveProgress * 100}%` }]} />
              <View style={[styles.progressDot, { left: `${liveProgress * 100}%` }]} />
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <Pressable
              focusable={isTV}
              onFocus={() => { setFocusedControl('play'); pingControls('play'); }}
              onBlur={() => setFocusedControl(null)}
              onPress={() => { setIsPaused(p => !p); pingControls(); }}
              style={[styles.playBtn, focusedControl === 'play' && styles.btnFocused]}>
              {isPaused
                ? <PlayIcon size={20} color="#fff" />
                : <PauseIcon size={20} color="#fff" />}
            </Pressable>

            <Text style={styles.timeText}>
              {liveElapsed} | {liveDuration}
            </Text>

            <View style={styles.rightControls}>
              <Pressable
                focusable={isTV}
                onFocus={() => { setFocusedControl('schedule'); pingControls('schedule'); }}
                onBlur={() => setFocusedControl(null)}
                onPress={toggleEpg}
                style={[
                  styles.scheduleBtn,
                  epgVisible && styles.btnActive,
                  focusedControl === 'schedule' && styles.btnFocused,
                ]}>
                <ScheduleIcon size={16} color="#fff" />
                <Text style={styles.scheduleBtnLabel}>
                  {t('tv_channels.schedule')}
                </Text>
              </Pressable>

              <Pressable
                focusable={isTV}
                onFocus={() => { setFocusedControl('tv'); pingControls('tv'); }}
                onBlur={() => setFocusedControl(null)}
                onPress={() => navigation.goBack()}
                style={[styles.iconBtn, focusedControl === 'tv' && styles.btnFocused]}>
                <TvIcon size={22} color="#fff" />
              </Pressable>

              <Pressable
                focusable={isTV}
                onFocus={() => { setFocusedControl('settings'); pingControls('settings'); }}
                onBlur={() => setFocusedControl(null)}
                onPress={toggleSettings}
                style={[
                  styles.iconBtn,
                  settingsVisible && styles.btnActive,
                  focusedControl === 'settings' && styles.btnFocused,
                ]}>
                <SettingsIcon size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* SETTINGS PANEL */}
      {settingsVisible && !epgVisible && (
        <View style={styles.settingsPanel}>
          <Text style={styles.panelSectionLabel}>Размер субтитров</Text>
          <View style={styles.chipRow}>
            {SUBTITLE_SIZE_OPTIONS.map(opt => (
              <Pressable
                key={opt}
                focusable={isTV}
                onPress={() => setSubtitleSize(opt)}
                style={[styles.chip, subtitleSize === opt && styles.chipActive]}>
                <Text style={[styles.chipText, subtitleSize === opt && styles.chipTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.panelSectionLabel}>Качество</Text>
          <View style={styles.chipRow}>
            {QUALITY_OPTIONS.map(opt => (
              <Pressable
                key={opt}
                focusable={isTV}
                onPress={() => setQuality(opt)}
                style={[styles.chip, quality === opt && styles.chipActive]}>
                <Text style={[styles.chipText, quality === opt && styles.chipTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.panelSectionLabel}>Язык</Text>
          <View style={styles.chipRow}>
            {["Русский", "O'zbek"].map(opt => (
              <Pressable
                key={opt}
                focusable={isTV}
                onPress={() => setAudioLang(opt)}
                style={[styles.chip, audioLang === opt && styles.chipActive]}>
                <Text style={[styles.chipText, audioLang === opt && styles.chipTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* EPG PANEL */}
      {epgVisible && (
        <View style={styles.epgPanel}>
          {/* Header */}
          <View style={styles.epgHeader}>
            <Pressable
              focusable={isTV}
              onPress={() => setEpgVisible(false)}
              style={styles.epgCloseBtn}>
              <CloseXIcon size={16} color="#fff" />
            </Pressable>
            <Text style={styles.epgTitle}>Расписание программы</Text>
          </View>

          {/* Sana chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.epgDateScroll}
            contentContainerStyle={styles.epgDateContent}>
            {dateChips.map(chip => {
              const active = chip.key === selectedDayKey;
              return (
                <Pressable
                  key={chip.key}
                  focusable={isTV}
                  onPress={() => setSelectedDayKey(chip.key)}
                  style={[styles.epgDateChip, active && styles.epgDateChipActive]}>
                  <Text style={[styles.epgDateChipText, active && styles.epgDateChipTextActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Dasturlar ro'yxati */}
          {epgLoading ? (
            <View style={styles.epgLoader}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <FlatList
              data={epgPrograms}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.epgList}
              renderItem={({ item }) => {
                const isCurrent = isCurrentProgram(item);
                return (
                  <View style={[styles.epgItem, isCurrent && styles.epgItemCurrent]}>
                    <View style={styles.epgItemLeft}>
                      <View style={[styles.epgDot, isCurrent && styles.epgDotCurrent]} />
                    </View>
                    <View style={styles.epgItemBody}>
                      <Text style={styles.epgItemTime}>
                        {formatProgramTime(item.starts_at)} – {formatProgramTime(item.ends_at)}
                      </Text>
                      <Text
                        style={[styles.epgItemTitle, isCurrent && styles.epgItemTitleCurrent]}
                        numberOfLines={2}>
                        {item.title}
                      </Text>
                      {isCurrent && (
                        <View style={styles.liveBadge}>
                          <Text style={styles.liveBadgeText}>Прямой эфир</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.epgEmpty}>Нет данных</Text>
              }
            />
          )}

          {/* Pastki vaqt */}
          <View style={styles.epgBottomRow}>
            <Text style={styles.epgBottomTime}>
              {liveElapsed} | {liveDuration}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  posterFallback: {
    backgroundColor: '#0a0a0a',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 190,
    zIndex: 1,
  },
  bufferOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Network toast
  networkToast: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    gap: 8,
    zIndex: 20,
  },
  toastOffline: {
    backgroundColor: 'rgba(24,24,24,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toastOnline: {
    backgroundColor: 'rgba(22,163,74,0.95)',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },

  // Top row
  topRow: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(20,20,20,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  topChannelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  topProgramName: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginTop: 2,
  },
  topRight: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  clockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Bottom
  bottomWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 20,
    zIndex: 5,
  },
  progressRow: {
    marginBottom: 14,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#ef4444',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    top: -5,
    marginLeft: -7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  rightControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scheduleBtnLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  btnFocused: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  btnActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Settings
  settingsPanel: {
    position: 'absolute',
    right: 18,
    bottom: 90,
    width: 360,
    backgroundColor: 'rgba(16,16,16,0.96)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    zIndex: 8,
  },
  panelSectionLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: '#fff',
  },
  chipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // EPG
  epgPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '38%',
    backgroundColor: 'rgba(10,10,10,0.97)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.07)',
    zIndex: 10,
  },
  epgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  epgCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  epgTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  epgDateScroll: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  epgDateContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  epgDateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  epgDateChipActive: {
    backgroundColor: '#fff',
  },
  epgDateChipText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '500',
  },
  epgDateChipTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  epgLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  epgList: {
    flex: 1,
  },
  epgItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  epgItemCurrent: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  epgItemLeft: {
    width: 18,
    alignItems: 'center',
    paddingTop: 5,
  },
  epgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  epgDotCurrent: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  epgItemBody: {
    flex: 1,
    paddingLeft: 10,
  },
  epgItemTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginBottom: 3,
  },
  epgItemTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 18,
  },
  epgItemTitleCurrent: {
    color: '#fff',
    fontWeight: '600',
  },
  liveBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  epgEmpty: {
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  epgBottomRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  epgBottomTime: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
});
