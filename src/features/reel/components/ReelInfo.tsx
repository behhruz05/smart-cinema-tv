import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Reel } from '../../../service/reel.service';
import { getAppLanguage } from '../../../i18n';
import { PlayIcon } from '../../../shared/icons/PlayIcon';
import { useNavigation } from '@react-navigation/native';

interface ReelInfoProps {
  reel: Reel;
  nextFocusUp?: number;
  nextFocusDown?: number;
}

export function ReelInfo({
  reel,
  nextFocusUp,
  nextFocusDown,
}: ReelInfoProps) {
  const { t, i18n } = useTranslation();
  const isTV = Platform.isTV;
  const navigation = useNavigation<any>();
  const [focusedWatch, setFocusedWatch] = React.useState(false);
  const tvDirectionalFocusProps = isTV
    ? ({
        nextFocusUp,
        nextFocusDown,
      } as any)
    : null;
  const lang = getAppLanguage(i18n.resolvedLanguage || i18n.language);
  const title = lang === 'ru'
    ? reel.title_ru || reel.title_uz || reel.title_en
    : lang === 'en'
      ? reel.title_en || reel.title_uz || reel.title_ru
      : reel.title_uz || reel.title_ru || reel.title_en;
  const description = lang === 'ru'
    ? reel.description_ru || reel.description_uz || reel.description_en
    : lang === 'en'
      ? reel.description_en || reel.description_uz || reel.description_ru
      : reel.description_uz || reel.description_ru || reel.description_en;

  return (
    <View>
      <View style={styles.profileRow}>
        <Image
          source={{ uri: reel.poster_url }}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            {description}
          </Text>
        </View>
      </View>

      <Pressable
        focusable={!isTV}
        {...tvDirectionalFocusProps}
        onFocus={() => setFocusedWatch(true)}
        onBlur={() => setFocusedWatch(false)}
        style={[
          styles.watchBtn,
          focusedWatch && styles.watchBtnFocused,
        ]}
        onPress={() =>
               navigation.navigate('MovieDetail', {
                movieId: reel.linked_movies[0]?.id,
              })
        }
      >
        <PlayIcon size={16} />
        <Text style={styles.watchText}>
          {t('reel.watch_movie')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '90%'
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2a2a2a',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
  },
  watchBtn: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    gap: 10
  },
  watchBtnFocused: {
    borderColor: '#ffffff',
  },
  watchText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
