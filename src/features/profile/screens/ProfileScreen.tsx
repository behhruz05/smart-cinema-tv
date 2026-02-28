import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../../store';
import { WatchHistory } from '../../../shared/components/WatchHistory';
import { fetchHistory } from '../../../store/slice/home.slice';
import { Section } from '../../../shared/components/Section';
import { fetchFavoriteMovies } from '../../../store/slice/movie.slice';
import { NewMovieCard } from '../../../shared/components/NewMovieCard';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { history } =
    useSelector((state: RootState) => state.home);
  const { favoriteMovies } =
    useSelector((state: RootState) => state.movie);
  const lang = i18n.language.startsWith('ru')
    ? 'ru'
    : i18n.language.startsWith('en')
      ? 'en'
      : 'uz';

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchHistory());
      dispatch(
        fetchFavoriteMovies({ page: 1, pageSize: 20, lang }),
      );
    }, [dispatch, lang]),
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={[{ key: 'content' }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <>
          {/* User Info */}
          <View style={styles.userBlock}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.name}>
                {user?.full_name || t('profile.default_name')}
              </Text>
              <Text style={styles.userId}>
                ID: {user?.id || '00001'}
              </Text>
            </View>
          </View>

          {/* History */}
          <Section title={t('profile.my_rentals')} data={history}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={history?.filter(item => Boolean(item?.id))}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <WatchHistory item={item} />
              )}
            />
          </Section>

          {/* Saved */}
          <Section title={t('profile.saved')} data={favoriteMovies}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={favoriteMovies?.filter(item => Boolean(item?.id))}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <NewMovieCard
                  movie={item}
                  style={styles.savedCard}
                />
              )}
            />
          </Section>
        </>
      )}
    />
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101010',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50,
    gap: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2a2a2a',
  },

  name: {
    color: '#fff',
    fontSize: 28,
  },

  userId: {
    color: '#888',
    marginTop: 6,
  },
  savedCard: {
    width: 200,
    marginRight: 16,
  },
});
