import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StreamPayload } from '../services/streaming.api';

type SubtitleSize = 'small' | 'default' | 'large';

type PlayerSettingsPanelProps = {
  isTV: boolean;
  preferFirstChipFocus?: boolean;
  focusedSettingChip: string | null;
  onFocusSettingChip: (value: string | null) => void;
  subtitleSize: SubtitleSize;
  onChangeSubtitleSize: (value: SubtitleSize) => void;
  subtitleLanguage: string;
  onChangeSubtitleLanguage: (value: string) => void;
  audioLanguage: string | null;
  onChangeAudioLanguage: (value: string) => void;
  onApplyAndClose: () => void;
  subtitles: StreamPayload['subtitles'];
  audioTracks: StreamPayload['audio_tracks'];
  t: (key: string) => string;
  styles: any;
};

export const PlayerSettingsPanel = React.memo(function PlayerSettingsPanel({
  isTV,
  preferFirstChipFocus = false,
  focusedSettingChip,
  onFocusSettingChip,
  subtitleSize,
  onChangeSubtitleSize,
  subtitleLanguage,
  onChangeSubtitleLanguage,
  audioLanguage,
  onChangeAudioLanguage,
  onApplyAndClose,
  subtitles,
  audioTracks,
  t,
  styles,
}: PlayerSettingsPanelProps) {
  return (
    <View style={styles.settingsPanel}>
      <Text style={styles.panelTitle}>{t('player.subtitle_size')}</Text>
      <View style={styles.row}>
        {(['small', 'default', 'large'] as SubtitleSize[]).map((item) => (
          <Pressable
            key={item}
            focusable={isTV}
            hasTVPreferredFocus={isTV && preferFirstChipFocus && item === 'small'}
            onFocus={() => onFocusSettingChip(`size-${item}`)}
            onBlur={() => onFocusSettingChip(null)}
            onPress={() => {
              onChangeSubtitleSize(item);
              onApplyAndClose();
            }}
            style={[
              styles.chip,
              subtitleSize === item && styles.chipActive,
              focusedSettingChip === `size-${item}` && styles.focusedControl,
            ]}
          >
            <Text style={styles.chipText}>{t(`player.size_${item}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.panelTitle}>{t('player.subtitles')}</Text>
      <View style={styles.row}>
        <Pressable
          focusable={isTV}
          onFocus={() => onFocusSettingChip('subtitle-off')}
          onBlur={() => onFocusSettingChip(null)}
          onPress={() => {
            onChangeSubtitleLanguage('off');
            onApplyAndClose();
          }}
          style={[
            styles.chip,
            subtitleLanguage === 'off' && styles.chipActive,
            focusedSettingChip === 'subtitle-off' && styles.focusedControl,
          ]}
        >
          <Text style={styles.chipText}>{t('player.off')}</Text>
        </Pressable>
        {(subtitles || []).map((item) => (
          <Pressable
            key={item.id}
            focusable={isTV}
            onFocus={() => onFocusSettingChip(`subtitle-${item.id}`)}
            onBlur={() => onFocusSettingChip(null)}
            onPress={() => {
              onChangeSubtitleLanguage(item.language);
              onApplyAndClose();
            }}
            style={[
              styles.chip,
              subtitleLanguage === item.language && styles.chipActive,
              focusedSettingChip === `subtitle-${item.id}` && styles.focusedControl,
            ]}
          >
            <Text style={styles.chipText}>{item.language.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.panelTitle}>{t('player.audio_tracks')}</Text>
      <View style={styles.row}>
        {(audioTracks || []).map((item) => (
          <Pressable
            key={item.id}
            focusable={isTV}
            onFocus={() => onFocusSettingChip(`audio-${item.id}`)}
            onBlur={() => onFocusSettingChip(null)}
            onPress={() => {
              onChangeAudioLanguage(item.language);
              onApplyAndClose();
            }}
            style={[
              styles.chip,
              audioLanguage === item.language && styles.chipActive,
              focusedSettingChip === `audio-${item.id}` && styles.focusedControl,
            ]}
          >
            <Text style={styles.chipText}>{item.language.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});
