import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Reel } from '../../../service/reel.service';
import { ReelInfo } from './ReelInfo';
import { ReelAction } from './ReelAction';
import { resolveReelPlaybackCandidates } from '../../../shared/utils/reel';
import { AppDispatch, RootState } from '../../../store';
import { fetchStreamUrl } from '../../../store/slice/reel.slice';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { PauseIcon } from '../../../shared/icons/PauseIcon';

const { height, width } = Dimensions.get('window');
const fill = StyleSheet.absoluteFillObject;

function getVideoComponent(): React.ComponentType<any> | null {
  try {
    const moduleRef = require('react-native-video');
    return (moduleRef?.default || moduleRef) as React.ComponentType<any>;
  } catch {
    return null;
  }
}

interface ReelCardProps {
  reel: Reel;
  index: number;
  isActive: boolean;
  screenActive: boolean;
  preferredFocus: boolean;
  nextFocusUp?: number;
  nextFocusDown?: number;
  onLikeFocus: (index: number) => void;
  setLikeRef: (index: number, node: any) => void;
}

export const ReelCard = memo(function ReelCard({
  reel,
  index,
  isActive,
  screenActive,
  preferredFocus,
  nextFocusUp,
  nextFocusDown,
  onLikeFocus,
  setLikeRef,
}: ReelCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isTV = Platform.isTV;
  const videoRef = useRef<any>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamUrlMap = useSelector((state: RootState) => state.reel.streamUrlMap);
  const [focusedCenter, setFocusedCenter] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [secureFailed, setSecureFailed] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [urlResolved, setUrlResolved] = useState(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const urlResolvedRef = useRef(false);
  const playbackCandidates = useMemo(() => resolveReelPlaybackCandidates(reel), [reel]);
  const VideoElement = useMemo(() => getVideoComponent(), []);

  useEffect(() => {
    urlResolvedRef.current = false;
    setUrlResolved(false);
    setFirstFrameReady(false);
    setPosterReady(false);
    setSourceIndex(0);
    setVideoReady(false);
    setIsBuffering(false);
    setSecureFailed(false);
    setIsPaused(false);
  }, [reel.id]);

  useEffect(() => {
    if (!isActive || !screenActive) {
      setIsPaused(false);
      setShowOverlay(false);
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    }
  }, [isActive, screenActive]);

  useEffect(() => {
    if (!isActive) {
      videoRef.current?.seek?.(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (!VideoElement && __DEV__) {
      console.error(
        'Reel video player is unavailable. Install react-native-video.',
      );
    }
  }, [VideoElement]);

  useEffect(() => {
    if (!isActive || !screenActive) return;
    if (urlResolvedRef.current) return;

    if (streamUrlMap[reel.id]) {
      urlResolvedRef.current = true;
      setUrlResolved(true);
      return;
    }

    dispatch(fetchStreamUrl(reel.id))
      .unwrap()
      .catch(() => null)
      .finally(() => {
        urlResolvedRef.current = true;
        setUrlResolved(true);
      });
  }, [dispatch, isActive, reel.id, screenActive, streamUrlMap]);

  useEffect(() => {
    return () => {
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const secureStreamUrl = streamUrlMap[reel.id];
  const streamUrl = urlResolved
    ? ((!secureFailed && secureStreamUrl) || playbackCandidates[sourceIndex] || null)
    : null;

  const showSpinner =
    isActive &&
    screenActive &&
    VideoElement &&
    (!urlResolved || !videoReady || isBuffering);

  const handleTogglePlayPause = useCallback(() => {
    if (!isActive || !screenActive) return;

    const next = !isPaused;
    setIsPaused(next);
    setShowOverlay(true);

    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);

    if (!next) {
      overlayTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 700);
    }
  }, [isActive, isPaused, screenActive]);

  const handleVideoError = useCallback(() => {
    if (secureStreamUrl && !secureFailed) {
      setSecureFailed(true);
      setFirstFrameReady(false);
      return;
    }

    if (sourceIndex + 1 < playbackCandidates.length) {
      setSourceIndex((prev) => prev + 1);
      setFirstFrameReady(false);
    }
  }, [playbackCandidates.length, secureFailed, secureStreamUrl, sourceIndex]);

  const tvPressProps = isTV
    ? ({
        onKeyDown: (event: any) => {
          const key = event?.nativeEvent?.key;
          if (key !== 'Enter' && key !== 'Select' && key !== ' ') return;
          handleTogglePlayPause();
        },
      } as any)
    : null;

  return (
    <View style={styles.screen}>
      <View style={styles.infoSide}>
        <ReelInfo
          reel={reel}
          nextFocusUp={nextFocusUp}
          nextFocusDown={nextFocusDown}
        />
      </View>

      <View style={styles.reelWrapper}>
        <Pressable
          focusable={isTV}
          hasTVPreferredFocus={isTV && preferredFocus}
          onFocus={() => {
            setFocusedCenter(true);
            onLikeFocus(index);
          }}
          onBlur={() => setFocusedCenter(false)}
          onPress={handleTogglePlayPause}
          {...tvPressProps}
          style={[styles.center, focusedCenter && styles.centerFocused]}
        >
          {VideoElement && streamUrl ? (
            <VideoElement
              ref={videoRef}
              source={{ uri: streamUrl }}
              paused={!isActive || !screenActive || isPaused}
              repeat
              resizeMode="cover"
              style={fill}
              onLoadStart={() => {
                setIsBuffering(true);
                setVideoReady(false);
              }}
              onLoad={() => {
                setVideoReady(true);
              }}
              onReadyForDisplay={() => {
                setIsBuffering(false);
                setVideoReady(true);
                setFirstFrameReady(true);
              }}
              onBuffer={({ isBuffering: buffering }: { isBuffering: boolean }) => {
                setIsBuffering(Boolean(buffering));
              }}
              onProgress={({ currentTime }: { currentTime: number }) => {
                if (typeof currentTime === 'number' && currentTime >= 0 && !firstFrameReady) {
                  setFirstFrameReady(true);
                }
              }}
              onError={handleVideoError}
            />
          ) : null}

          {!firstFrameReady ? (
            <>
              <View style={styles.posterFallback} />
              <Image
                source={{ uri: reel.poster_url }}
                style={[fill, !posterReady && styles.posterHidden]}
                resizeMode="cover"
                onLoadEnd={() => setPosterReady(true)}
              />
            </>
          ) : null}

          {showOverlay ? (
            <View style={fill}>
              <View style={styles.overlayIconWrap}>
                <View style={styles.overlayIconInner}>
                  {isPaused ? (
                    <PlayIcon size={28} color="#fff" />
                  ) : (
                    <PauseIcon size={28} color="#fff" />
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {showSpinner ? (
            <View style={fill}>
              <View style={styles.spinnerWrap}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.actionSide}>
          <ReelAction
            reel={reel}
            preferredFocus={false}
            nextFocusUp={nextFocusUp}
            nextFocusDown={nextFocusDown}
            onLikeFocus={() => onLikeFocus(index)}
            setLikeRef={node => setLikeRef(index, node)}
          />
        </View>
      </View>

      <View style={styles.rightSpacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  screen: {
    height,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#101010',
    paddingBottom: 110,
    paddingHorizontal: 20,
  },
  infoSide: {
    flex: 2,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  reelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  center: {
    width: width * 0.28,
    height: height * 0.76,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#1f1f1f',
    backgroundColor: '#141414',
  },
  centerFocused: {
    borderColor: '#fff',
  },
  spinnerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayIconWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterFallback: {
    ...fill,
    backgroundColor: '#1a1a1a',
  },
  posterHidden: {
    opacity: 0,
  },
  overlayIconInner: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSide: {
    marginLeft: 12,
    alignItems: 'center',
  },
  rightSpacer: {
    flex: 1,
  },
});
