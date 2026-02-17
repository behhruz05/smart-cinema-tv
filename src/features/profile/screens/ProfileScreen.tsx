import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '../../../store';
import { WatchHistory } from '../../../shared/components/WatchHistory';
import { fetchHistory } from '../../../store/slice/home.slice';
import { Section } from '../../../shared/components/Section';

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { history } =
    useSelector((state: RootState) => state.home);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

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
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WatchHistory item={item} />
              )}
            />
          </Section>

          {/* Saved */}
          <Section title={t('profile.saved')} data={history}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WatchHistory item={item} />
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
});
