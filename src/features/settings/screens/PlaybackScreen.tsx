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
  const isDarkMode = resolvedTheme === 'dark';

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
        isDarkMode && styles.checkboxDark,
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
        isDarkMode && styles.containerDark,
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        {t('settings.playback')}
      </Text>
      <Text
        style={[
          styles.subtitle,
          isDarkMode && styles.subtitleDark,
        ]}
      >
        {t('settings.playback_desc')}
      </Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus={isTV}
        onFocus={() => setFocused('autoplay')}
        onBlur={() => setFocused(null)}
        onPress={toggleAutoplay}
        style={[
          styles.row,
          isDarkMode && styles.rowDark,
          focused === 'autoplay' && styles.focused,
          isDarkMode &&
            focused === 'autoplay' &&
            styles.focusedDark,
        ]}
      >
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {t('settings.autoplay_next')}
        </Text>
        {renderCheck(autoplayNext)}
      </Pressable>

      <Text
        style={[
          styles.sectionTitle,
          isDarkMode && styles.sectionTitleDark,
        ]}
      >
        {t('settings.video_quality')}
      </Text>
      <Text
        style={[
          styles.sectionSubtitle,
          isDarkMode && styles.subtitleDark,
        ]}
      >
        {t('settings.video_quality_desc')}
      </Text>

      {(['auto', '1080', '720'] as QualityType[]).map(
        (item, index) => (
          <Pressable
            key={item}
            focusable={isTV}
            hasTVPreferredFocus={isTV && index === 0 && !autoplayNext}
            onFocus={() => setFocused(`quality-${item}`)}
            onBlur={() => setFocused(null)}
            onPress={() => setVideoQuality(item)}
            style={[
              styles.row,
              isDarkMode && styles.rowDark,
              focused === `quality-${item}` && styles.focused,
              isDarkMode &&
                focused === `quality-${item}` &&
                styles.focusedDark,
            ]}
          >
            <Text
              style={[
                styles.label,
                isDarkMode && styles.labelDark,
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
  containerDark: {
    backgroundColor: '#111111',
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#a1a1a1',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleDark: {
    color: '#ffffff',
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
  rowDark: {
    backgroundColor: '#181818',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedDark: {
    borderColor: '#ffffff',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  labelDark: {
    color: '#ffffff',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b8b8b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDark: {
    borderColor: '#9a9a9a',
  },
  checkboxActive: {
    borderColor: '#ffffff',
  },
  checkboxDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
});
