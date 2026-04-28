import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
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
const SEEK_STEP_PROGRESS_SECONDS = 30;
const SEEK_STEP_PROGRESS_VISIBLE_SECONDS = 10;
const SEEK_STEP_PROGRESS_HOLD_SECONDS = 20;
const SEEK_BURST_WINDOW_MS = 900;
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

function matchesAnyEventType(
  rawType: string,
  aliases: string[],
): boolean {
  const normalized = String(rawType || '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
  if (!normalized) return false;
  return aliases.some(alias => {
    const token = alias.toLowerCase();
    return normalized === token || normalized.includes(token);
  });
}

export function PlayerScreen() {
  const { t } = useTranslation();
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation<PlayerNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isAndroid = Platform.OS === 'android';

  const isTV = useMemo(() => {
    const constants = (Platform as any)?.constants || {};
    const uiMode = String(constants.uiMode || '').toLowerCase();
    return Boolean(
      Platform.isTV ||
      (Platform as any).isTVOS ||
      uiMode === 'tv' ||
      uiMode === 'television',
    );
  }, []);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef<any>(null);
  const didSeekToResumeRef = useRef(false);
  const currentTimeRef = useRef(0);
  const lastProgressSentRef = useRef(0);
  const lastProgressSentAtRef = useRef(0);
  const streamRequestIdRef = useRef(0);
  const consumedPreloadedStreamRef = useRef(false);
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
  const seekBurstDirectionRef = useRef<-1 | 0 | 1>(0);
  const seekBurstTotalRef = useRef(0);
  const seekBurstLastAtRef = useRef(0);
  const lastTVEventRef = useRef<{ type: string; at: number } | null>(null);
  const focusedControlRef = useRef<FocusedControlId>(null);

  const {
    movieId,
    episodeId,
    sourceUri,
    posterUri,
    title,
    subtitle,
    isLive = false,
    durationSeconds = 0,
    preloadedStreamPayload,
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
  const [seekDelta, setSeekDelta] = useState(SEEK_STEP_SECONDS);
  const [settingsFocusToken, setSettingsFocusToken] = useState(0);

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
      if (isPausedRef.current) return;
      setControlsVisible(false);
      setSettingsVisible(false);
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
    } catch (error: any) {
      if (streamRequestIdRef.current !== requestId) return;
      if (sourceUri) {
        setResolvedSourceUri(sourceUri);
        setPlaybackCandidates([sourceUri]);
        setCandidateIndex(0);
        setStreamError(null);
      } else {
        const status = Number(error?.status);
        const backendMessage =
          typeof error?.message === 'string' ? error.message.trim() : '';
        const message = Number.isFinite(status) && status > 0
          ? `${backendMessage || t('player.stream_unavailable')} (${status})`
          : backendMessage || t('player.stream_unavailable');

        if (__DEV__) {
          console.log('loadStream request error:', {
            movieId,
            episodeId,
            status: error?.status,
            message: error?.message,
            payload: error?.payload,
          });
        }
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

  useEffect(() => {
    focusedControlRef.current = focusedControl;
  }, [focusedControl]);

  useEffect(() => {
    if (!settingsVisible) return;
    if (isPaused) return;

    const timer = setTimeout(() => {
      setSettingsVisible(false);
      setFocusedControl('progress');
      setFocusedSettingChip(null);
    }, CONTROLS_HIDE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isPaused, settingsVisible]);

  useEffect(() => {
    if (!controlsVisible) {
      lastTVEventRef.current = null;
      setSettingsVisible(false);
    }
  }, [controlsVisible]);

  const seekBy = useCallback(
    (delta: number, revealControls = true) => {
      if (!canSeek) return;
      const next = Math.max(0, Math.min(duration, currentTimeRef.current + delta));
      setCurrentTime(next);
      currentTimeRef.current = next;
      playerRef.current?.seek?.(next);

      const direction: -1 | 1 = delta < 0 ? -1 : 1;
      const amount = Math.max(1, Math.abs(Math.round(delta)));
      const now = Date.now();
      const sameBurst =
        seekBurstDirectionRef.current === direction &&
        now - seekBurstLastAtRef.current <= SEEK_BURST_WINDOW_MS;
      const nextBurstTotal = sameBurst ? seekBurstTotalRef.current + amount : amount;

      seekBurstDirectionRef.current = direction;
      seekBurstTotalRef.current = nextBurstTotal;
      seekBurstLastAtRef.current = now;

      setSeekIndicatorVisible(true);
      setSeekDelta(direction * nextBurstTotal);
      if (seekIndicatorTimeoutRef.current) {
        clearTimeout(seekIndicatorTimeoutRef.current);
      }
      seekIndicatorTimeoutRef.current = setTimeout(() => {
        setSeekIndicatorVisible(false);
        seekBurstDirectionRef.current = 0;
        seekBurstTotalRef.current = 0;
        seekBurstLastAtRef.current = 0;
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
    consumedPreloadedStreamRef.current = false;
  }, [episodeId, movieId, preloadedStreamPayload]);

  useEffect(() => {
    if (movieId || episodeId) {
      setResolvedSourceUri(null);
      setPlaybackCandidates([]);
      setCandidateIndex(0);
      if (preloadedStreamPayload && !consumedPreloadedStreamRef.current) {
        consumedPreloadedStreamRef.current = true;
        try {
          applyStreamPayload(preloadedStreamPayload);
          setLoadingStream(false);
          setStreamError(null);
          streamReloadAttemptRef.current = 0;
          return;
        } catch {
          // fall back to remote loading
        }
      }
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
  }, [
    applyStreamPayload,
    episodeId,
    loadStream,
    movieId,
    preloadedStreamPayload,
    sourceUri,
  ]);

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

  const handleTVEvent = useCallback((event: { eventType?: string; eventKeyAction?: number; keyCode?: number; repeatCount?: number }) => {
    if (__DEV__) {
      console.log('TV remote event (normalized input):', event);
    }
    const keyCode = event?.keyCode;
    const repeatCount = typeof event?.repeatCount === 'number' ? event.repeatCount : 0;
    const rawEventType = String(event?.eventType || '');
    const normalizedEventType = rawEventType.toLowerCase().trim();
    const isLeftKey =
      keyCode === 21 || keyCode === 37 || keyCode === 89 ||
      matchesAnyEventType(rawEventType, [
        'left',
        'arrowleft',
        'dpadleft',
        'dpad_left',
        'keycode_dpad_left',
        'swipeleft',
      ]);
    const isRightKey =
      keyCode === 22 || keyCode === 39 || keyCode === 90 ||
      matchesAnyEventType(rawEventType, [
        'right',
        'arrowright',
        'dpadright',
        'dpad_right',
        'keycode_dpad_right',
        'swiperight',
      ]);
    const isUpKey =
      keyCode === 19 || keyCode === 38 ||
      matchesAnyEventType(rawEventType, [
        'up',
        'arrowup',
        'dpadup',
        'dpad_up',
        'keycode_dpad_up',
      ]);
    const isDownKey =
      keyCode === 20 || keyCode === 40 ||
      matchesAnyEventType(rawEventType, [
        'down',
        'arrowdown',
        'dpaddown',
        'dpad_down',
        'keycode_dpad_down',
      ]);
    const isEnterKey =
      keyCode === 23 || keyCode === 66 ||
      matchesAnyEventType(rawEventType, [
        'select',
        'enter',
        'center',
        'dpad_center',
        'keycode_dpad_center',
      ]);
    const isPlayPauseKey =
      keyCode === 85 ||
      matchesAnyEventType(rawEventType, ['playpause', 'media_play_pause', 'keycode_media_play_pause']);
    const isPlayKey =
      keyCode === 126 ||
      matchesAnyEventType(rawEventType, ['play', 'media_play', 'keycode_media_play']);
    const isPauseKey =
      keyCode === 127 ||
      matchesAnyEventType(rawEventType, ['pause', 'media_pause', 'keycode_media_pause']);
    const isStopKey =
      keyCode === 86 ||
      matchesAnyEventType(rawEventType, ['stop', 'media_stop', 'keycode_media_stop']);
    const isVolumeUpKey =
      keyCode === 24 ||
      matchesAnyEventType(rawEventType, ['volumeup', 'volume_up', 'keycode_volume_up']);
    const isVolumeDownKey =
      keyCode === 25 ||
      matchesAnyEventType(rawEventType, ['volumedown', 'volume_down', 'keycode_volume_down']);
    const isMuteKey =
      keyCode === 164 || keyCode === 91 ||
      matchesAnyEventType(rawEventType, ['mute', 'volume_mute', 'keycode_volume_mute']);
    const isMenuKey =
      keyCode === 4 || keyCode === 111 || keyCode === 82 ||
      matchesAnyEventType(rawEventType, [
        'menu',
        'back',
        'escape',
        'keycode_back',
      ]);

    if (
      !isLeftKey &&
      !isRightKey &&
      !isUpKey &&
      !isDownKey &&
      !isEnterKey &&
      !isPlayPauseKey &&
      !isPlayKey &&
      !isPauseKey &&
      !isStopKey &&
      !isVolumeUpKey &&
      !isVolumeDownKey &&
      !isMuteKey &&
      !isMenuKey &&
      typeof keyCode !== 'number'
    ) {
      return;
    }

    // When controls are hidden, player surface is the active layer:
    // left/right seek, up/down reopen menu, enter toggles playback.
    if (!controlsVisibleRef.current) {
      if (isLeftKey) {
        const step =
          focusedControlRef.current === 'progress'
            ? SEEK_STEP_PROGRESS_SECONDS
            : SEEK_STEP_SECONDS;
        seekByRef.current(-step, false);
        return;
      }

      if (isRightKey) {
        const step =
          focusedControlRef.current === 'progress'
            ? SEEK_STEP_PROGRESS_SECONDS
            : SEEK_STEP_SECONDS;
        seekByRef.current(step, false);
        return;
      }

      if (isUpKey) {
        setControlsVisible(true);
        setSettingsVisible(false);
        setFocusedControl('progress');
        pingControlsRef.current();
        return;
      }

      if (isMenuKey) {
        setControlsVisible(true);
        setSettingsVisible(true);
        setFocusedControl(null);
        setSettingsFocusToken(prev => prev + 1);
        pingControlsRef.current();
        return;
      }

      if (isDownKey) {
        setControlsVisible(true);
        setSettingsVisible(false);
        setFocusedControl('progress');
        pingControlsRef.current();
        return;
      }

      if (isPlayPauseKey) {
        togglePlayPauseRef.current();
        return;
      }

      if (isPlayKey) {
        setIsPaused(false);
        return;
      }

      if (isPauseKey) {
        setIsPaused(true);
        return;
      }

      if (isStopKey) {
        setIsPaused(true);
        if (canSeek) {
          setCurrentTime(0);
          currentTimeRef.current = 0;
          playerRef.current?.seek?.(0);
        }
        return;
      }

      if (isMuteKey) {
        setIsMuted(prev => !prev);
        return;
      }

      // Let TV OS control hardware volume keys.
      if (isVolumeUpKey || isVolumeDownKey) {
        return;
      }

      if (!isEnterKey) {
        return;
      }

      setControlsVisible(true);
      pingControlsRef.current();
      togglePlayPauseRef.current();
      return;
    }

    const now = Date.now();
    const last = lastTVEventRef.current;
    // Some remotes emit only UP, some emit DOWN+UP.
    // De-duplicate by keyCode in a short window so one physical press = one action.
    const fingerprint =
      typeof keyCode === 'number'
        ? `kc:${keyCode}`
        : `et:${normalizedEventType || 'unknown'}`;
    if (repeatCount === 0 && last && last.type === fingerprint && now - last.at < 120) {
      return;
    }
    lastTVEventRef.current = { type: fingerprint, at: now };

    // When controls are visible, keep DPAD for focus/navigation only.
    // Custom left/right seek and up/down panel switching should run only when controls are hidden.
    if (isLeftKey || isRightKey || isUpKey || isDownKey) {
      if (
        !settingsVisibleRef.current &&
        focusedControlRef.current === 'progress' &&
        canSeek &&
        (isLeftKey || isRightKey)
      ) {
        const step =
          repeatCount >= 2
            ? SEEK_STEP_PROGRESS_HOLD_SECONDS
            : SEEK_STEP_PROGRESS_VISIBLE_SECONDS;
        seekByRef.current(isLeftKey ? -step : step, true);
      }
      pingControlsRef.current();
      return;
    }

    if (isEnterKey) {
      if (controlsVisibleRef.current) {
        pingControlsRef.current();
        if (focusedControlRef.current) {
          return;
        }
        togglePlayPauseRef.current();
      } else {
        setControlsVisible(true);
        pingControlsRef.current();
      }
      return;
    }
    if (isPlayPauseKey) {
      pingControlsRef.current();
      togglePlayPauseRef.current();
      return;
    }
    if (isPlayKey) {
      setIsPaused(false);
      pingControlsRef.current();
      return;
    }
    if (isPauseKey) {
      setIsPaused(true);
      pingControlsRef.current();
      return;
    }
    if (isMenuKey) {
      setControlsVisible(true);
      setSettingsVisible(prev => {
        const next = !prev;
        if (next) {
          setFocusedControl(null);
          setSettingsFocusToken(token => token + 1);
        }
        return next;
      });
      pingControlsRef.current();
      return;
    }

    const type =
      isLeftKey
        ? 'left'
        : isRightKey
          ? 'right'
          : isUpKey
            ? 'up'
            : isDownKey
              ? 'down'
                : isEnterKey
                  ? 'select'
                  : isPlayPauseKey
                    ? 'playPause'
                    : isPlayKey
                      ? 'play'
                      : isPauseKey
                        ? 'pause'
                : isStopKey
                  ? 'stop'
                  : isVolumeUpKey
                    ? 'volumeUp'
                    : isVolumeDownKey
                      ? 'volumeDown'
                      : isMuteKey
                        ? 'mute'
                : isMenuKey
                  ? 'menu'
                  : 'unknown';

    if (type === 'playPause') {
      if (!controlsVisibleRef.current) {
        setControlsVisible(true);
      }
      pingControlsRef.current();
      togglePlayPauseRef.current();
      return;
    }

    if (type === 'stop') {
      setIsPaused(true);
      if (canSeek) {
        setCurrentTime(0);
        currentTimeRef.current = 0;
        playerRef.current?.seek?.(0);
      }
      setControlsVisible(true);
      setSettingsVisible(false);
      pingControlsRef.current();
      return;
    }

    if (type === 'mute') {
      setIsMuted(prev => !prev);
      pingControlsRef.current();
      return;
    }

    if (type === 'volumeUp' || type === 'volumeDown') {
      // Let the TV system handle actual volume, keep overlay alive.
      pingControlsRef.current();
      return;
    }

    if (settingsVisibleRef.current && type === 'select') {
      pingControlsRef.current();
      return;
    }

    if (type === 'select') {
      if (controlsVisibleRef.current) {
        pingControlsRef.current();
        if (focusedControlRef.current) {
          return;
        }
        togglePlayPauseRef.current();
        return;
      }
      setControlsVisible(true);
      pingControlsRef.current();
      return;
    }

    if (type === 'menu') {
      setControlsVisible(true);
      setSettingsVisible(prev => {
        const next = !prev;
        if (next) {
          setFocusedControl(null);
          setSettingsFocusToken(token => token + 1);
        }
        return next;
      });
      pingControlsRef.current();
      return;
    }

    if (type === 'unknown') {
      return;
    }

    if (!controlsVisibleRef.current) {
      setControlsVisible(true);
    }
    pingControlsRef.current();
    if (settingsVisibleRef.current) {
      setSettingsVisible(false);
    }
  }, [canSeek]);

  const tvRootPressProps = isTV && !isAndroid
    ? ({
    onKeyDown: (event: any) => {
      const key = event?.nativeEvent?.key || event?.nativeEvent?.eventType;
      const keyCode = event?.nativeEvent?.keyCode;
      const eventKeyAction = event?.nativeEvent?.eventKeyAction;
      if (!key && typeof keyCode !== 'number') return;
      handleTVEvent({
        eventType: key ? String(key) : undefined,
        eventKeyAction: typeof eventKeyAction === 'number' ? eventKeyAction : undefined,
        keyCode: typeof keyCode === 'number' ? keyCode : undefined,
        repeatCount: typeof event?.nativeEvent?.repeatCount === 'number' ? event.nativeEvent.repeatCount : undefined,
      });
    },
  } as any)
    : null;

  useEffect(() => {
    if (!(isTV || isAndroid)) return;
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
  }, [handleTVEvent, isTV, isAndroid]);

  useEffect(() => {
    if (!isAndroid) return;
    const sub = DeviceEventEmitter.addListener('TV_REMOTE_KEY', (payload: any) => {
      if (__DEV__) {
        console.log('TV_REMOTE_KEY payload:', payload);
      }
      const action = String(payload?.action || '').toUpperCase();
      const keyCode = typeof payload?.keyCode === 'number' ? payload.keyCode : undefined;
      const keyName = payload?.keyName ? String(payload.keyName) : undefined;
      handleTVEvent({
        eventType: keyName,
        eventKeyAction: action === 'UP' ? 1 : 0,
        keyCode,
        repeatCount: typeof payload?.repeatCount === 'number' ? payload.repeatCount : undefined,
      });
    });
    return () => {
      sub.remove();
    };
  }, [handleTVEvent, isAndroid]);

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
        </View>
      )}

      {seekIndicatorVisible && !streamError && (
        <View pointerEvents="none" style={styles.seekOverlay}>
          <View style={styles.seekOverlayCard}>
            <Text style={styles.seekOverlayText}>
              {seekDelta > 0 ? `+${Math.abs(seekDelta)}s` : `\u2212${Math.abs(seekDelta)}s`}
            </Text>
          </View>
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

      {controlsVisible && !streamError && (
        <PlayerTopRow
          isTV={isTV}
          focusedControl={topFocusedControl}
          onFocusControl={setFocusedControl}
          onBackPress={() => navigation.goBack()}
          preferBackFocus={!settingsVisible}
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
              key={`settings-${settingsFocusToken}`}
              isTV={isTV}
              preferFirstChipFocus
              focusedSettingChip={focusedSettingChip}
              onFocusSettingChip={setFocusedSettingChip}
              subtitleSize={subtitleSize}
              onChangeSubtitleSize={setSubtitleSize}
              subtitleLanguage={subtitleLanguage}
              onChangeSubtitleLanguage={setSubtitleLanguage}
              audioLanguage={audioLanguage}
              onChangeAudioLanguage={setAudioLanguage}
              onApplyAndClose={() => {
                setSettingsVisible(false);
                setFocusedSettingChip(null);
                setFocusedControl('settings');
                pingControls();
              }}
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
            onSeekBackward={() =>
              seekBy(
                focusedControl === 'progress'
                  ? -SEEK_STEP_PROGRESS_VISIBLE_SECONDS
                  : -SEEK_STEP_SECONDS,
              )
            }
            onSeekForward={() =>
              seekBy(
                focusedControl === 'progress'
                  ? SEEK_STEP_PROGRESS_VISIBLE_SECONDS
                  : SEEK_STEP_SECONDS,
              )
            }
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  seekActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactActionsWrap: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 3,
  },
  compactActionBtn: {
    minWidth: 58,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(14,14,14,0.62)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  compactActionText: {
    color: '#fff',
    fontSize: 12,
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
  seekOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  seekOverlayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.58)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  seekOverlayText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  progressTrackFocused: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
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
