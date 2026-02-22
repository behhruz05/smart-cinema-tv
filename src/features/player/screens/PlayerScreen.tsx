import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../../types/navigations';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;
type PlayerNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

type PlayerQuality = 'auto' | '4k' | '2k' | '1080' | '720';
type SubtitleSize = 'small' | 'default' | 'large';
type PlayerLanguage = 'ru' | 'uz' | 'en';
type FocusedControlId =
  | null
  | 'play'
  | 'rewind'
  | 'forward'
  | 'mute'
  | 'settings'
  | 'schedule'
  | 'back';

function getVideoComponent(): React.ComponentType<any> | null {
  try {
    const moduleRef = require('react-native-video');
    return (moduleRef?.default || moduleRef) as React.ComponentType<any>;
  } catch {
    return null;
  }
}

function getTVEventHandlerClass(): any {
  try {
    const nativeModule = require('react-native');
    return nativeModule?.TVEventHandler ?? null;
  } catch {
    return null;
  }
}

function formatTimer(rawSeconds: number) {
  const seconds = Math.max(0, Math.floor(rawSeconds));
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  if (hh > 0) {
    return `${hh.toString().padStart(2, '0')}:${mm
      .toString()
      .padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }
  return `${mm.toString().padStart(2, '0')}:${ss
    .toString()
    .padStart(2, '0')}`;
}

export function PlayerScreen() {
  const { t } = useTranslation();
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation<PlayerNavigationProp>();
  const isTV = Platform.isTV;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tvHandlerRef = useRef<any>(null);
  const playerRef = useRef<any>(null);

  const {
    sourceUri,
    posterUri,
    title,
    subtitle,
    isLive = false,
    durationSeconds = 0,
  } = route.params;

  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [focusedControl, setFocusedControl] =
    useState<FocusedControlId>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    Math.max(durationSeconds || 0, isLive ? 0 : 1),
  );
  const [quality, setQuality] = useState<PlayerQuality>('auto');
  const [subtitleSize, setSubtitleSize] = useState<SubtitleSize>('default');
  const [language, setLanguage] = useState<PlayerLanguage>('ru');

  const VideoComponent = useMemo(() => getVideoComponent(), []);
  const TVEventHandlerClass = useMemo(() => getTVEventHandlerClass(), []);
  const VideoElement = VideoComponent as any;
  const hasVideoSource =
    !!sourceUri &&
    /^(https?:\/\/|rtmp:\/\/|file:\/\/)/i.test(sourceUri);
  const canSeek = !isLive && duration > 0;
  const progressPercent = canSeek
    ? Math.min(100, (currentTime / duration) * 100)
    : 100;

  const pingControls = React.useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (!settingsVisible && isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4500);
    }
  }, [isPlaying, settingsVisible]);

  const seekBy = React.useCallback((delta: number) => {
    if (!canSeek) return;
    const next = Math.max(0, Math.min(duration, currentTime + delta));
    setCurrentTime(next);
    if (playerRef.current?.seek) {
      playerRef.current.seek(next);
    }
    pingControls();
  }, [canSeek, currentTime, duration, pingControls]);

  const togglePlayPause = React.useCallback(() => {
    setIsPlaying(prev => !prev);
    pingControls();
  }, [pingControls]);

  const toggleSettings = React.useCallback(() => {
    setSettingsVisible(prev => !prev);
    pingControls();
  }, [pingControls]);

  const toggleMute = React.useCallback(() => {
    setMuted(prev => !prev);
    pingControls();
  }, [pingControls]);

  useEffect(() => {
    pingControls();
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isPlaying, pingControls, settingsVisible]);

  useEffect(() => {
    if (VideoComponent || isLive || !isPlaying) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      return;
    }

    progressTimerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (!canSeek) return prev;
        return Math.min(duration, prev + 1);
      });
    }, 1000);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [VideoComponent, isLive, isPlaying, canSeek, duration]);

  useEffect(() => {
    if (!isTV || !TVEventHandlerClass) return;

    const handler = new TVEventHandlerClass();
    handler.enable(null, (_: any, event: { eventType?: string }) => {
      const type = event?.eventType;
      if (!type) return;

      if (type === 'playPause') {
        togglePlayPause();
        return;
      }

      if (type === 'left') {
        seekBy(-10);
        return;
      }

      if (type === 'right') {
        seekBy(10);
        return;
      }

      if (type === 'up') {
        setControlsVisible(true);
        pingControls();
        return;
      }

      if (type === 'down') {
        if (controlsVisible) {
          setSettingsVisible(prev => !prev);
        } else {
          setControlsVisible(true);
          pingControls();
        }
        return;
      }

      if (type === 'menu') {
        if (settingsVisible) {
          setSettingsVisible(false);
          pingControls();
        } else {
          navigation.goBack();
        }
      }
    });
    tvHandlerRef.current = handler;

    return () => {
      tvHandlerRef.current?.disable?.();
      tvHandlerRef.current = null;
    };
  }, [
    TVEventHandlerClass,
    controlsVisible,
    isTV,
    navigation,
    pingControls,
    seekBy,
    settingsVisible,
    togglePlayPause,
  ]);

  return (
    <Pressable
      onPress={pingControls}
      focusable={false}
      style={styles.screen}
    >
      {VideoElement && hasVideoSource ? (
        <VideoElement
          ref={playerRef}
          source={{ uri: sourceUri! }}
          paused={!isPlaying}
          muted={muted}
          resizeMode="cover"
          repeat={!isLive}
          onLoad={(payload: any) => {
            if (typeof payload?.duration === 'number' && payload.duration > 0) {
              setDuration(payload.duration);
            }
          }}
          onProgress={(payload: any) => {
            if (!isLive && typeof payload?.currentTime === 'number') {
              setCurrentTime(payload.currentTime);
            }
          }}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <ImageBackground
          source={{ uri: posterUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <Pressable
          focusable={isTV}
          hasTVPreferredFocus={isTV}
          onFocus={() => setFocusedControl('back')}
          onBlur={() => setFocusedControl(null)}
          onPress={() => navigation.goBack()}
          style={[
            styles.roundControl,
            focusedControl === 'back' && styles.focusedControl,
          ]}
        >
          <Text style={styles.roundControlText}>×</Text>
        </Pressable>

        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <Text style={styles.clock}>
          {new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {controlsVisible && (
        <>
          {settingsVisible && (
            <View style={styles.settingsPanel}>
              <Text style={styles.panelTitle}>{t('player.subtitle_size')}</Text>
              <View style={styles.row}>
                {(['default', 'small', 'large'] as SubtitleSize[]).map(item => (
                  <Pressable
                    key={item}
                    focusable={isTV}
                    onPress={() => setSubtitleSize(item)}
                    style={[
                      styles.chip,
                      subtitleSize === item && styles.chipActive,
                    ]}
                  >
                    <Text style={styles.chipText}>{t(`player.size_${item}`)}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.panelTitle}>{t('player.quality')}</Text>
              <View style={styles.row}>
                {(['auto', '4k', '2k', '1080', '720'] as PlayerQuality[]).map(item => (
                  <Pressable
                    key={item}
                    focusable={isTV}
                    onPress={() => setQuality(item)}
                    style={[
                      styles.chip,
                      quality === item && styles.chipActive,
                    ]}
                  >
                    <Text style={styles.chipText}>
                      {item === 'auto' ? 'Auto' : item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.panelTitle}>{t('player.language')}</Text>
              <View style={styles.row}>
                {(['ru', 'uz', 'en'] as PlayerLanguage[]).map(item => (
                  <Pressable
                    key={item}
                    focusable={isTV}
                    onPress={() => setLanguage(item)}
                    style={[
                      styles.chip,
                      language === item && styles.chipActive,
                    ]}
                  >
                    <Text style={styles.chipText}>{item.toUpperCase()}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.bottomWrap}>
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTimer(currentTime)}</Text>
              <Text style={styles.timeText}>
                {isLive ? 'LIVE' : formatTimer(duration)}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.leftActions}>
                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('play')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={() => {
                    togglePlayPause();
                  }}
                  style={[
                    styles.actionBtn,
                    focusedControl === 'play' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.actionText}>
                    {isPlaying ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('rewind')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={() => seekBy(-10)}
                  style={[
                    styles.actionBtn,
                    focusedControl === 'rewind' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.actionText}>⟲10</Text>
                </Pressable>

                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('forward')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={() => seekBy(10)}
                  style={[
                    styles.actionBtn,
                    focusedControl === 'forward' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.actionText}>10⟳</Text>
                </Pressable>

                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('mute')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={toggleMute}
                  style={[
                    styles.actionBtn,
                    focusedControl === 'mute' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.actionText}>{muted ? '🔇' : '🔊'}</Text>
                </Pressable>
              </View>

              <View style={styles.rightActions}>
                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('schedule')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={() => setControlsVisible(false)}
                  style={[
                    styles.secondaryActionBtn,
                    focusedControl === 'schedule' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.secondaryActionText}>
                    {t('tv_channels.schedule')}
                  </Text>
                </Pressable>

                <Pressable
                  focusable={isTV}
                  onFocus={() => setFocusedControl('settings')}
                  onBlur={() => setFocusedControl(null)}
                  onPress={() => {
                    toggleSettings();
                  }}
                  style={[
                    styles.actionBtn,
                    focusedControl === 'settings' && styles.focusedControl,
                  ]}
                >
                  <Text style={styles.actionText}>⚙</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  topRow: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#d4d4d8',
    marginTop: 2,
    fontSize: 13,
  },
  clock: {
    color: '#fff',
    fontSize: 14,
  },
  roundControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(17,17,17,0.65)',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundControlText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
  },
  bottomWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 20,
    zIndex: 3,
  },
  progressRow: {
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: '#f00020',
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    minWidth: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(17,17,17,0.75)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  secondaryActionBtn: {
    minWidth: 144,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(17,17,17,0.75)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  actionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  focusedControl: {
    borderColor: '#fff',
  },
  settingsPanel: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    width: 360,
    borderRadius: 14,
    backgroundColor: 'rgba(40,40,40,0.88)',
    padding: 16,
    zIndex: 4,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
});
