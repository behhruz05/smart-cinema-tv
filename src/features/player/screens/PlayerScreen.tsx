import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useDispatch } from 'react-redux';
import { RootStackParamList } from '../../../types/navigations';
import { showErrorToast } from '../../../store/slice/ui.slice';
import { AppDispatch } from '../../../store';
import { streamingApi, StreamPayload } from '../services/streaming.api';
import { getAppLanguage } from '../../../i18n';
import { tokenStorage } from '../../../shared/lib/tokenStorage';
import { PlayerTopRow } from '../components/PlayerTopRow';
import { PlayerSettingsPanel } from '../components/PlayerSettingsPanel';
import { PlayerBottomControls } from '../components/PlayerBottomControls';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;
type PlayerNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SubtitleSize = 'small' | 'default' | 'large';
type FocusedControlId =
  | null
  | 'play'
  | 'rewind'
  | 'forward'
  | 'progress'
  | 'mute'
  | 'settings'
  | 'back'
  | 'retry';
const MAX_STREAM_RELOADS = 2;
const SEEK_STEP_SECONDS = 10;
const CONTROLS_HIDE_DELAY_MS = 5000;

function getVideoComponent(): React.ComponentType<any> | null {
  try {
    const moduleRef = require('react-native-video');
    return (moduleRef?.default || moduleRef) as React.ComponentType<any>;
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

function extractHttpStatusCode(error?: any): number | null {
  const text = String(error?.errorStackTrace || error?.cause?.message || '');
  const match = text.match(/Response code:\s*(\d{3})/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function PlayerScreen() {
  const { t } = useTranslation();
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation<PlayerNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();

  const isTV = Platform.isTV || Platform.OS === 'android';
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef<any>(null);
  const didSeekToResumeRef = useRef(false);
  const currentTimeRef = useRef(0);
  const lastProgressSentRef = useRef(0);
  const lastProgressSentAtRef = useRef(0);
  const streamRequestIdRef = useRef(0);
  const streamReloadAttemptRef = useRef(0);
  const firstFrameReadyRef = useRef(false);
  const playbackFailureRef = useRef<(error?: any) => void>(() => {});
  const isPausedRef = useRef(false);
  const settingsVisibleRef = useRef(false);
  const controlsVisibleRef = useRef(true);
  const seekByRef = useRef<(delta: number, revealControls?: boolean) => void>(() => {});
  const togglePlayPauseRef = useRef<() => void>(() => {});
  const pingControlsRef = useRef<() => void>(() => {});
  const seekIndicatorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTVEventRef = useRef<{ type: string; at: number } | null>(null);

  const {
    movieId,
    episodeId,
    sourceUri,
    posterUri,
    title,
    subtitle,
    isLive = false,
    durationSeconds = 0,
  } = route.params;
  const shouldResolveRemoteStream = Boolean(movieId || episodeId);

  const [resolvedTitle, setResolvedTitle] = useState(title);
  const [resolvedSourceUri, setResolvedSourceUri] = useState<string | null>(
    shouldResolveRemoteStream ? null : (sourceUri || null),
  );
  const [playbackCandidates, setPlaybackCandidates] = useState<string[]>(
    shouldResolveRemoteStream ? [] : (sourceUri ? [sourceUri] : []),
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [duration, setDuration] = useState(Math.max(durationSeconds || 0, isLive ? 0 : 1));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [focusedControl, setFocusedControl] = useState<FocusedControlId>(null);
  const [loadingStream, setLoadingStream] = useState(!!(movieId || episodeId));
  const [streamError, setStreamError] = useState<string | null>(null);
  const [videoBuffering, setVideoBuffering] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [subtitleSize, setSubtitleSize] = useState<SubtitleSize>('default');
  const [focusedSettingChip, setFocusedSettingChip] = useState<string | null>(null);
  const [subtitleLanguage, setSubtitleLanguage] = useState<string>('off');
  const [audioLanguage, setAudioLanguage] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<StreamPayload['subtitles']>([]);
  const [audioTracks, setAudioTracks] = useState<StreamPayload['audio_tracks']>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [seekIndicatorVisible, setSeekIndicatorVisible] = useState(false);

  const VideoComponent = useMemo(() => getVideoComponent(), []);
  const VideoElement = VideoComponent as any;

  const playbackUri =
    playbackCandidates[candidateIndex] || resolvedSourceUri || sourceUri || null;
  const hasVideoSource = Boolean(playbackUri && /^(https?:\/\/|rtmp:\/\/|file:\/\/)/i.test(playbackUri));
  const canSeek = !isLive && duration > 0;
  const progressPercent = canSeek ? Math.min(100, (currentTime / duration) * 100) : 100;
  const progressThumbPercent = Math.min(100, Math.max(0, progressPercent));
  const appLanguage = getAppLanguage();
  const topFocusedControl: 'back' | null = focusedControl === 'back' ? 'back' : null;
  const bottomFocusedControl:
    | 'play'
    | 'rewind'
    | 'forward'
    | 'progress'
    | 'mute'
    | 'settings'
    | null = ['play', 'rewind', 'forward', 'progress', 'mute', 'settings'].includes(
    String(focusedControl),
  )
    ? (focusedControl as 'play' | 'rewind' | 'forward' | 'progress' | 'mute' | 'settings')
    : null;

  useEffect(() => {
    let active = true;
    tokenStorage.get().then((token) => {
      if (active) {
        setAuthToken(token);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const pingControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (settingsVisibleRef.current) return;
      if (isPausedRef.current) return;
      setControlsVisible(false);
      setFocusedControl(null);
      setFocusedSettingChip(null);
    }, CONTROLS_HIDE_DELAY_MS);
  }, []);

  const clearStartupTimer = useCallback(() => {
    if (startupTimerRef.current) {
      clearTimeout(startupTimerRef.current);
      startupTimerRef.current = null;
    }
  }, []);

  const finalizePlaybackError = useCallback(
    (error?: any) => {
      const statusCode = extractHttpStatusCode(error);
      const message =
        statusCode === 404
          ? `${t('player.stream_unavailable')} (404)`
          : statusCode === 401
            ? `${t('player.stream_unavailable')} (401)`
            : t('player.stream_unavailable');
      if (__DEV__) {
        console.log('Player stream error:', error);
      }
      setStreamError(message);
      dispatch(showErrorToast(message));
    },
    [dispatch, t],
  );

  const submitProgress = useCallback(
    async (positionSeconds: number, force = false) => {
      if (isLive) return;
      if (!movieId && !episodeId) return;
      if (positionSeconds < 3) return;

      const now = Date.now();
      if (!force) {
        if (Math.abs(positionSeconds - lastProgressSentRef.current) < 15) return;
        if (now - lastProgressSentAtRef.current < 8000) return;
      }

      try {
        if (movieId) {
          await streamingApi.updateMovieProgress(movieId, positionSeconds);
        } else if (episodeId) {
          await streamingApi.updateEpisodeProgress(episodeId, positionSeconds);
        }
        lastProgressSentRef.current = positionSeconds;
        lastProgressSentAtRef.current = now;
      } catch {
        // background sync failures should not interrupt playback
      }
    },
    [episodeId, isLive, movieId],
  );

  const applyStreamPayload = useCallback(
    (payload: StreamPayload) => {
      if (!payload?.stream_url) {
        throw new Error(t('player.stream_unavailable'));
      }

      const nextCandidates = [payload.stream_url].filter(
        (item): item is string => Boolean(item),
      );
      if (sourceUri && !nextCandidates.includes(sourceUri)) {
        nextCandidates.push(sourceUri);
      }

      setResolvedTitle(payload.title || title);
      setResolvedSourceUri(payload.stream_url);
      setPlaybackCandidates(nextCandidates);
      setCandidateIndex(0);
      setDuration(Math.max(payload.duration_seconds || durationSeconds || 0, isLive ? 0 : 1));

      const resume = Math.max(0, payload.resume_position_seconds || 0);
      setCurrentTime(resume);
      currentTimeRef.current = resume;
      didSeekToResumeRef.current = false;

      const subtitleList = Array.isArray(payload.subtitles) ? payload.subtitles : [];
      const audioList = Array.isArray(payload.audio_tracks) ? payload.audio_tracks : [];

      setSubtitles(subtitleList);
      setAudioTracks(audioList);

      const defaultSubtitle = subtitleList.find(item => item.language === appLanguage)?.language || 'off';
      const defaultAudio =
        audioList.find(item => item.language === appLanguage)?.language ||
        audioList[0]?.language ||
        null;

      setSubtitleLanguage(defaultSubtitle);
      setAudioLanguage(defaultAudio);
    },
    [appLanguage, durationSeconds, isLive, sourceUri, t, title],
  );

  const loadStream = useCallback(async () => {
    if (!movieId && !episodeId) return;

    const requestId = Date.now();
    streamRequestIdRef.current = requestId;
    setLoadingStream(true);
    setStreamError(null);

    try {
      const payload = movieId
        ? await streamingApi.getMovieStream(movieId)
        : await streamingApi.getEpisodeStream(episodeId!);

      if (streamRequestIdRef.current !== requestId) return;
      applyStreamPayload(payload);
    } catch {
      if (streamRequestIdRef.current !== requestId) return;
      if (sourceUri) {
        setResolvedSourceUri(sourceUri);
        setPlaybackCandidates([sourceUri]);
        setCandidateIndex(0);
        setStreamError(null);
      } else {
        const message = t('player.stream_unavailable');
        setStreamError(message);
        dispatch(showErrorToast(message));
      }
    } finally {
      if (streamRequestIdRef.current === requestId) {
        setLoadingStream(false);
      }
    }
  }, [applyStreamPayload, dispatch, episodeId, movieId, sourceUri, t]);

  const handlePlaybackFailure = useCallback(
    (error?: any) => {
      if (__DEV__) {
        console.log('Player failed candidate:', {
          playbackUri,
          candidateIndex,
          playbackCandidates,
        });
      }
      setVideoBuffering(false);
      setLoadingStream(false);
      clearStartupTimer();

      if (candidateIndex + 1 < playbackCandidates.length) {
        setCandidateIndex((prev) => prev + 1);
        return;
      }

      if ((movieId || episodeId) && streamReloadAttemptRef.current < MAX_STREAM_RELOADS) {
        streamReloadAttemptRef.current += 1;
        loadStream();
        return;
      }

      finalizePlaybackError(error);
    },
    [
      candidateIndex,
      clearStartupTimer,
      episodeId,
      finalizePlaybackError,
      loadStream,
      movieId,
      playbackCandidates,
      playbackUri,
    ],
  );

  useEffect(() => {
    playbackFailureRef.current = handlePlaybackFailure;
  }, [handlePlaybackFailure]);

  useEffect(() => {
    firstFrameReadyRef.current = firstFrameReady;
  }, [firstFrameReady]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    settingsVisibleRef.current = settingsVisible;
  }, [settingsVisible]);

  useEffect(() => {
    controlsVisibleRef.current = controlsVisible;
  }, [controlsVisible]);

  const seekBy = useCallback(
    (delta: number, revealControls = true) => {
      if (!canSeek) return;
      const next = Math.max(0, Math.min(duration, currentTimeRef.current + delta));
      setCurrentTime(next);
      currentTimeRef.current = next;
      playerRef.current?.seek?.(next);
      setSeekIndicatorVisible(true);
      if (seekIndicatorTimeoutRef.current) {
        clearTimeout(seekIndicatorTimeoutRef.current);
      }
      seekIndicatorTimeoutRef.current = setTimeout(() => {
        setSeekIndicatorVisible(false);
      }, 1200);
      if (revealControls) {
        setControlsVisible(true);
        pingControls();
      }
    },
    [canSeek, duration, pingControls],
  );

  useEffect(() => {
    seekByRef.current = seekBy;
  }, [seekBy]);

  const togglePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
    pingControls();
  }, [pingControls]);

  useEffect(() => {
    togglePlayPauseRef.current = togglePlayPause;
  }, [togglePlayPause]);

  useEffect(() => {
    pingControlsRef.current = pingControls;
  }, [pingControls]);

  const toggleSettings = useCallback(() => {
    setSettingsVisible(prev => !prev);
    pingControls();
  }, [pingControls]);

  useEffect(() => {
    if (movieId || episodeId) {
      setResolvedSourceUri(null);
      setPlaybackCandidates([]);
      setCandidateIndex(0);
      loadStream();
      return;
    }
    if (sourceUri) {
      setResolvedSourceUri(sourceUri);
      setPlaybackCandidates([sourceUri]);
      setCandidateIndex(0);
      setLoadingStream(false);
      setStreamError(null);
    }
  }, [episodeId, loadStream, movieId, sourceUri]);

  useEffect(() => {
    setFirstFrameReady(false);
    firstFrameReadyRef.current = false;
    setVideoBuffering(Boolean(playbackUri));
    clearStartupTimer();

    if (!playbackUri) return;

    startupTimerRef.current = setTimeout(() => {
      if (!firstFrameReadyRef.current) {
        playbackFailureRef.current(new Error('Playback startup timeout'));
      }
    }, 15000);

    return () => {
      clearStartupTimer();
    };
  }, [clearStartupTimer, playbackUri]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    pingControls();
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [pingControls]);

  useEffect(() => {
    return () => {
      clearStartupTimer();
      if (seekIndicatorTimeoutRef.current) {
        clearTimeout(seekIndicatorTimeoutRef.current);
      }
      submitProgress(currentTimeRef.current, true);
    };
  }, [clearStartupTimer, submitProgress]);

  const handleTVEvent = useCallback((event: { eventType?: string; eventKeyAction?: number; keyCode?: number }) => {
    const rawType = event?.eventType;
    const keyCode = event?.keyCode;
    if (!rawType && typeof keyCode !== 'number') return;

    const normalized = (rawType || '').toLowerCase().trim();
    const now = Date.now();
    const last = lastTVEventRef.current;
    const fingerprint = `${normalized || 'keycode'}:${String(keyCode ?? '')}`;
    if (last && last.type === fingerprint && now - last.at < 80) {
      return;
    }
    lastTVEventRef.current = { type: fingerprint, at: now };

    const type =
      normalized === 'swipeleft'
        ? 'left'
        : normalized === 'swiperight'
          ? 'right'
          : normalized === 'swipeup'
            ? 'up'
            : normalized === 'swipedown'
              ? 'down'
              : normalized === 'rewind'
                ? 'left'
                : normalized === 'fastforward'
                  ? 'right'
                  : normalized === 'back'
                    ? 'menu'
                    : normalized === 'escape'
                      ? 'menu'
                      : normalized === 'arrowleft' || normalized === 'dpadleft'
                        ? 'left'
                        : normalized === 'arrowright' || normalized === 'dpadright'
                          ? 'right'
                          : normalized === 'arrowup' || normalized === 'dpadup'
                            ? 'up'
                            : normalized === 'arrowdown' || normalized === 'dpaddown'
                              ? 'down'
                              : normalized === 'select' || normalized === 'dpadcenter'
                                ? 'select'
                      : normalized === 'ok'
                        ? 'select'
                        : normalized === 'enter'
                          ? 'select'
                          : normalized === 'playpause'
                            ? 'playPause'
                            : normalized.includes('left')
                              ? 'left'
                              : normalized.includes('right')
                                ? 'right'
                                : normalized.includes('up')
                                  ? 'up'
                                  : normalized.includes('down')
                                    ? 'down'
                                    : normalized.includes('select') || normalized.includes('center')
                                      ? 'select'
                                      : normalized.includes('menu')
                                        ? 'menu'
                                        : typeof keyCode === 'number'
                                          ? keyCode === 21
                                            ? 'left'
                                            : keyCode === 22
                                              ? 'right'
                                              : keyCode === 19
                                                ? 'up'
                                                : keyCode === 20
                                                  ? 'down'
                                                  : keyCode === 37
                                                    ? 'left'
                                                    : keyCode === 39
                                                      ? 'right'
                                                      : keyCode === 38
                                                        ? 'up'
                                                        : keyCode === 40
                                                          ? 'down'
                                                  : keyCode === 23 || keyCode === 66
                                                    ? 'select'
                                                    : keyCode === 4 || keyCode === 111
                                                      ? 'menu'
                                                      : normalized
                                          : normalized;

    if (type === 'playPause') {
      if (!controlsVisibleRef.current) {
        setControlsVisible(true);
      }
      pingControlsRef.current();
      togglePlayPauseRef.current();
      return;
    }

    if (type === 'left') {
      if (settingsVisibleRef.current) {
        setSettingsVisible(false);
      }
      seekByRef.current(-SEEK_STEP_SECONDS, true);
      return;
    }

    if (type === 'right') {
      if (settingsVisibleRef.current) {
        setSettingsVisible(false);
      }
      seekByRef.current(SEEK_STEP_SECONDS, true);
      return;
    }

    if (type === 'down') {
      if (!controlsVisibleRef.current) {
        setControlsVisible(true);
        pingControlsRef.current();
        return;
      }
      if (!settingsVisibleRef.current) {
        setSettingsVisible(true);
      }
      pingControlsRef.current();
      return;
    }

    if (type === 'up') {
      if (!controlsVisibleRef.current) {
        setControlsVisible(true);
        pingControlsRef.current();
        return;
      }
      if (settingsVisibleRef.current) {
        setSettingsVisible(false);
      }
      pingControlsRef.current();
      return;
    }

    if (type === 'select') {
      if (controlsVisibleRef.current) {
        pingControlsRef.current();
        togglePlayPauseRef.current();
        return;
      }
      setControlsVisible(true);
      pingControlsRef.current();
      return;
    }

    if (type === 'menu') {
      setControlsVisible(true);
      setSettingsVisible(prev => !prev);
      pingControlsRef.current();
      return;
    }

    if (!controlsVisibleRef.current) {
      setControlsVisible(true);
    }
    pingControlsRef.current();
    if (settingsVisibleRef.current) {
      setSettingsVisible(false);
    }
  }, []);

  const tvRootPressProps = isTV
    ? ({
        onKeyDown: (event: any) => {
          const key = event?.nativeEvent?.key || event?.nativeEvent?.eventType;
          const keyCode = event?.nativeEvent?.keyCode;
          if (!key && typeof keyCode !== 'number') return;
          handleTVEvent({
            eventType: key ? String(key) : undefined,
            keyCode: typeof keyCode === 'number' ? keyCode : undefined,
          });
        },
      } as any)
    : null;

  const handleNativeTVKeyDown = useCallback(
    (event: any) => {
      const key = event?.nativeEvent?.key || event?.nativeEvent?.eventType;
      const keyCode = event?.nativeEvent?.keyCode;
      if (!key && typeof keyCode !== 'number') return;
      handleTVEvent({
        eventType: key ? String(key) : undefined,
        keyCode: typeof keyCode === 'number' ? keyCode : undefined,
      });
    },
    [handleTVEvent],
  );

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
      // no-op when TV event handler is unavailable on this platform/build
    }

    return () => {
      tvEventSubscription?.disable?.();
    };
  }, [handleTVEvent, isTV]);

  return (
    <Pressable
      onPress={pingControls}
      focusable={isTV}
      hasTVPreferredFocus={isTV}
      {...tvRootPressProps}
      style={styles.screen}
    >
      {VideoElement && hasVideoSource ? (
        <VideoElement
          ref={playerRef}
          source={{
            uri: playbackUri!,
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
              'Accept-Language': appLanguage,
            },
          }}
          paused={isPaused}
          muted={isMuted}
          resizeMode="cover"
          repeat={!isLive}
          onLoadStart={() => {
            setVideoBuffering(true);
            setFirstFrameReady(false);
          }}
          onLoad={(payload: any) => {
            const videoDuration = typeof payload?.duration === 'number' ? payload.duration : 0;
            if (videoDuration > 0 && !isLive) {
              setDuration(videoDuration);
            }
            setLoadingStream(false);
            setVideoBuffering(false);
            setFirstFrameReady(true);
            setStreamError(null);
            streamReloadAttemptRef.current = 0;
            clearStartupTimer();

            if (!didSeekToResumeRef.current && currentTimeRef.current > 0) {
              didSeekToResumeRef.current = true;
              playerRef.current?.seek?.(currentTimeRef.current);
            }
          }}
          onReadyForDisplay={() => {
            setLoadingStream(false);
            setVideoBuffering(false);
            setFirstFrameReady(true);
            setStreamError(null);
            streamReloadAttemptRef.current = 0;
            clearStartupTimer();
          }}
          onBuffer={({ isBuffering }: { isBuffering: boolean }) => {
            setVideoBuffering(Boolean(isBuffering));
          }}
          onProgress={(payload: any) => {
            if (isLive || typeof payload?.currentTime !== 'number') return;
            const next = payload.currentTime;
            setCurrentTime(next);
            currentTimeRef.current = next;
            submitProgress(next);
          }}
          onEnd={() => {
            if (!isLive) {
              submitProgress(duration, true);
            }
          }}
          onError={handlePlaybackFailure}
          selectedTextTrack={
            subtitleLanguage === 'off'
              ? { type: 'disabled' }
              : subtitleLanguage
                ? { type: 'language', value: subtitleLanguage }
                : undefined
          }
          selectedAudioTrack={
            audioLanguage
              ? { type: 'language', value: audioLanguage }
              : undefined
          }
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <>
          <View style={[StyleSheet.absoluteFill, styles.posterFallback]} />
          {posterUri ? (
            <ImageBackground
              source={{ uri: posterUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}
        </>
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.56)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.86)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {!streamError && !firstFrameReady && (loadingStream || videoBuffering) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{t('player.loading_stream')}</Text>
        </View>
      )}

      {streamError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>{streamError}</Text>
          <Pressable
            focusable={isTV}
            onFocus={() => setFocusedControl('retry')}
            onBlur={() => setFocusedControl(null)}
            onPress={loadStream}
            style={[
              styles.retryButton,
              focusedControl === 'retry' && styles.focusedControl,
            ]}
          >
            <Text style={styles.retryText}>{t('player.retry')}</Text>
          </Pressable>
        </View>
      )}

      {isTV && !streamError && (
        <Pressable
          focusable
          hasTVPreferredFocus={!controlsVisible}
          pointerEvents={controlsVisible ? 'none' : 'auto'}
          onPress={pingControls}
          onKeyDown={handleNativeTVKeyDown}
          style={styles.focusCatcher}
        />
      )}

      {controlsVisible && !streamError && (
        <PlayerTopRow
          isTV={isTV}
          focusedControl={topFocusedControl}
          onFocusControl={setFocusedControl}
          onBackPress={() => navigation.goBack()}
          title={resolvedTitle}
          subtitle={subtitle}
          isLive={isLive}
          liveLabel={t('player.live')}
          styles={styles}
        />
      )}

      {controlsVisible && !streamError && (
        <>
          {settingsVisible && (
            <PlayerSettingsPanel
              isTV={isTV}
              focusedSettingChip={focusedSettingChip}
              onFocusSettingChip={setFocusedSettingChip}
              subtitleSize={subtitleSize}
              onChangeSubtitleSize={setSubtitleSize}
              subtitleLanguage={subtitleLanguage}
              onChangeSubtitleLanguage={setSubtitleLanguage}
              audioLanguage={audioLanguage}
              onChangeAudioLanguage={setAudioLanguage}
              subtitles={subtitles}
              audioTracks={audioTracks}
              t={t}
              styles={styles}
            />
          )}

          <PlayerBottomControls
            isTV={isTV}
            canSeek={canSeek}
            focusedControl={bottomFocusedControl}
            onFocusControl={setFocusedControl}
            onPingControls={pingControls}
            progressPercent={progressPercent}
            progressThumbPercent={progressThumbPercent}
            seekIndicatorVisible={seekIndicatorVisible}
            currentTimeLabel={formatTimer(currentTime)}
            durationLabel={isLive ? t('player.live') : formatTimer(duration)}
            isPaused={isPaused}
            isMuted={isMuted}
            onTogglePlayPause={togglePlayPause}
            onSeekBackward={() => seekBy(-SEEK_STEP_SECONDS)}
            onSeekForward={() => seekBy(SEEK_STEP_SECONDS)}
            onToggleMute={() => {
              setIsMuted(prev => !prev);
              pingControls();
            }}
            onToggleSettings={toggleSettings}
            muteLabel={t('player.mute')}
            unmuteLabel={t('player.unmute')}
            styles={styles}
          />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
  },
  posterFallback: {
    backgroundColor: '#090909',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    minWidth: 140,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(20,20,20,0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topRow: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  roundControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13,13,13,0.78)',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedControl: {
    borderColor: '#fff',
  },
  focusCatcher: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 18,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#d4d4d8',
    marginTop: 2,
    fontSize: 13,
  },
  rightInfoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clock: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  liveChip: {
    color: '#fff',
    backgroundColor: '#b91c1c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
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
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  timeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
    minWidth: 52,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(20,20,20,0.78)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  settingsPanel: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    width: 380,
    borderRadius: 14,
    backgroundColor: 'rgba(22,22,22,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    zIndex: 4,
  },
  panelTitle: {
    color: '#fff',
    fontSize: 13,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
