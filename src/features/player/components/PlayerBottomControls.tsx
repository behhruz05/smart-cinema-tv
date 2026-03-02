import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { PauseIcon } from '../../../shared/icons/PauseIcon';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { SettingsIcon } from '../../../shared/icons/SettingIcon';

type PlayerBottomControlsProps = {
  isTV: boolean;
  canSeek: boolean;
  focusedControl: 'play' | 'rewind' | 'forward' | 'progress' | 'mute' | 'settings' | null;
  onFocusControl: (
    control: 'play' | 'rewind' | 'forward' | 'progress' | 'mute' | 'settings' | null,
  ) => void;
  onPingControls: () => void;
  progressPercent: number;
  progressThumbPercent: number;
  seekIndicatorVisible: boolean;
  currentTimeLabel: string;
  durationLabel: string;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  onToggleMute: () => void;
  onToggleSettings: () => void;
  muteLabel: string;
  unmuteLabel: string;
  styles: any;
};

export const PlayerBottomControls = React.memo(function PlayerBottomControls({
  isTV,
  canSeek,
  focusedControl,
  onFocusControl,
  onPingControls,
  progressPercent,
  progressThumbPercent,
  seekIndicatorVisible,
  currentTimeLabel,
  durationLabel,
  isPaused,
  isMuted,
  onTogglePlayPause,
  onSeekBackward,
  onSeekForward,
  onToggleMute,
  onToggleSettings,
  muteLabel,
  unmuteLabel,
  styles,
}: PlayerBottomControlsProps) {
  const handleProgressKeyDown = React.useCallback(
    (event: any) => {
      const key = String(event?.nativeEvent?.key || event?.nativeEvent?.eventType || '').toLowerCase();
      const keyCode = event?.nativeEvent?.keyCode;

      const isLeft =
        key === 'arrowleft' ||
        key === 'dpadleft' ||
        key === 'left' ||
        key === 'swipeleft' ||
        keyCode === 21 ||
        keyCode === 37;
      const isRight =
        key === 'arrowright' ||
        key === 'dpadright' ||
        key === 'right' ||
        key === 'swiperight' ||
        keyCode === 22 ||
        keyCode === 39;

      if (isLeft) {
        onSeekBackward();
        onPingControls();
      } else if (isRight) {
        onSeekForward();
        onPingControls();
      }
    },
    [onPingControls, onSeekBackward, onSeekForward],
  );

  const tvProgressPressProps = isTV
    ? ({
        onKeyDown: handleProgressKeyDown,
      } as any)
    : null;

  return (
    <View style={styles.bottomWrap}>
      <View style={styles.progressRow}>
        <Pressable
          focusable={isTV && canSeek}
          onFocus={() => {
            onFocusControl('progress');
            onPingControls();
          }}
          onBlur={() => onFocusControl(null)}
          {...tvProgressPressProps}
          style={[
            styles.progressTrack,
            focusedControl === 'progress' && styles.progressTrackFocused,
          ]}
        >
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          {canSeek && seekIndicatorVisible && (
            <View style={[styles.progressThumb, { left: `${progressThumbPercent}%` }]} />
          )}
        </Pressable>
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{currentTimeLabel}</Text>
        <Text style={styles.timeText}>{durationLabel}</Text>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.leftActions}>
          <Pressable
            focusable={isTV}
            onFocus={() => {
              onFocusControl('play');
              onPingControls();
            }}
            onBlur={() => onFocusControl(null)}
            onPress={onTogglePlayPause}
            style={[styles.actionBtn, focusedControl === 'play' && styles.focusedControl]}
          >
            {isPaused ? <PlayIcon size={22} color="#fff" /> : <PauseIcon size={22} color="#fff" />}
          </Pressable>

          <Pressable
            focusable={isTV}
            onFocus={() => {
              onFocusControl('rewind');
              onPingControls();
            }}
            onBlur={() => onFocusControl(null)}
            onPress={onSeekBackward}
            style={[styles.actionBtn, focusedControl === 'rewind' && styles.focusedControl]}
          >
            <Text style={styles.actionText}>-10</Text>
          </Pressable>

          <Pressable
            focusable={isTV}
            onFocus={() => {
              onFocusControl('forward');
              onPingControls();
            }}
            onBlur={() => onFocusControl(null)}
            onPress={onSeekForward}
            style={[styles.actionBtn, focusedControl === 'forward' && styles.focusedControl]}
          >
            <Text style={styles.actionText}>+10</Text>
          </Pressable>

          <Pressable
            focusable={isTV}
            onFocus={() => {
              onFocusControl('mute');
              onPingControls();
            }}
            onBlur={() => onFocusControl(null)}
            onPress={onToggleMute}
            style={[styles.actionBtn, focusedControl === 'mute' && styles.focusedControl]}
          >
            <Text style={styles.actionText}>{isMuted ? unmuteLabel : muteLabel}</Text>
          </Pressable>
        </View>

        <View style={styles.rightActions}>
          <Pressable
            focusable={isTV}
            onFocus={() => {
              onFocusControl('settings');
              onPingControls();
            }}
            onBlur={() => onFocusControl(null)}
            onPress={onToggleSettings}
            style={[styles.actionBtn, focusedControl === 'settings' && styles.focusedControl]}
          >
            <SettingsIcon size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
});
