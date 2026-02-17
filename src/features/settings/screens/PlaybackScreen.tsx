import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appSettingsStorage } from '../../../shared/lib/appSettingsStorage';
import { useAuth } from '../../../app/providers/AppProviders';

type QualityType = 'auto' | '1080' | '720';

export default function PlaybackScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isTV = Platform.isTV;
  const isLight = resolvedTheme === 'light';

  const [autoplayNext, setAutoplayNext] = useState(false);
  const [quality, setQuality] = useState<QualityType>('auto');
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const autoplay = await appSettingsStorage.getBoolean(
        'autoplayNext',
        false
      );
      const savedQuality = await appSettingsStorage.getString(
        'videoQuality',
        'auto'
      );

      setAutoplayNext(autoplay);
      if (
        savedQuality === 'auto' ||
        savedQuality === '1080' ||
        savedQuality === '720'
      ) {
        setQuality(savedQuality);
      }
    };

    load();
  }, []);

  const toggleAutoplay = async () => {
    const next = !autoplayNext;
    setAutoplayNext(next);
    await appSettingsStorage.setBoolean('autoplayNext', next);
  };

  const setVideoQuality = async (next: QualityType) => {
    if (next === quality) return;
    setQuality(next);
    await appSettingsStorage.setString('videoQuality', next);
  };

  const renderCheck = (active: boolean) => (
    <View
      style={[
        styles.checkbox,
        isLight && styles.checkboxLight,
        active && styles.checkboxActive,
      ]}
    >
      {active && <View style={styles.checkboxDot} />}
    </View>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        isLight && styles.containerLight,
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isLight && styles.titleLight]}>
        {t('settings.playback')}
      </Text>
      <Text
        style={[
          styles.subtitle,
          isLight && styles.subtitleLight,
        ]}
      >
        {t('settings.playback_desc')}
      </Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus
        onFocus={() => setFocused('autoplay')}
        onBlur={() => setFocused(null)}
        onPress={toggleAutoplay}
        style={[
          styles.row,
          isLight && styles.rowLight,
          focused === 'autoplay' && styles.focused,
          isLight &&
            focused === 'autoplay' &&
            styles.focusedLight,
        ]}
      >
        <Text style={[styles.label, isLight && styles.labelLight]}>
          {t('settings.autoplay_next')}
        </Text>
        {renderCheck(autoplayNext)}
      </Pressable>

      <Text
        style={[
          styles.sectionTitle,
          isLight && styles.sectionTitleLight,
        ]}
      >
        {t('settings.video_quality')}
      </Text>
      <Text
        style={[
          styles.sectionSubtitle,
          isLight && styles.subtitleLight,
        ]}
      >
        {t('settings.video_quality_desc')}
      </Text>

      {(['auto', '1080', '720'] as QualityType[]).map(
        (item, index) => (
          <Pressable
            key={item}
            focusable={isTV}
            hasTVPreferredFocus={index === 0 && !autoplayNext}
            onFocus={() => setFocused(`quality-${item}`)}
            onBlur={() => setFocused(null)}
            onPress={() => setVideoQuality(item)}
            style={[
              styles.row,
              isLight && styles.rowLight,
              focused === `quality-${item}` && styles.focused,
              isLight &&
                focused === `quality-${item}` &&
                styles.focusedLight,
            ]}
          >
            <Text
              style={[
                styles.label,
                isLight && styles.labelLight,
              ]}
            >
              {t(`settings.quality_${item}`)}
            </Text>
            {renderCheck(quality === item)}
          </Pressable>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  containerLight: {
    backgroundColor: '#f4f4f5',
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleLight: {
    color: '#111827',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleLight: {
    color: '#111827',
  },
  sectionSubtitle: {
    color: '#a3a3a3',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  rowLight: {
    backgroundColor: '#ffffff',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedLight: {
    borderColor: '#2563eb',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  labelLight: {
    color: '#111827',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    borderWidth: 2,
    borderColor: '#A1A1A1A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLight: {
    borderColor: '#fff',
  },
  checkboxActive: {
    borderColor: '#fff',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: '#fff',
  },
});
