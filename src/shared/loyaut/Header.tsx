import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setQuery } from '../../store/slice/search.slice';

import { SearchIcon } from '../icons/SearchIcon';
import { VoiceIcon } from '../icons/VoiceIcon';
import { UserIcon } from '../icons/UserIcon';
import { BackIcon } from '../icons/BackIcon';

export function Header() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const dispatch = useDispatch();

  const { query } = useSelector((state: RootState) => state.search);

  const [focused, setFocused] = useState<string | null>(null);

  const isSearch = route.name === 'Search';
  const isTV = Platform.isTV;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {isSearch ? (
          <Pressable
            focusable={isTV}
            hasTVPreferredFocus
            onFocus={() => setFocused('back')}
            onBlur={() => setFocused(null)}
            onPress={() => navigation.goBack()}
            style={[
              styles.back,
              focused === 'back' && styles.focusedButton,
            ]}
          >
            <BackIcon size={20} color="#fff" />
            <Text style={styles.backText}>Назад</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.date}>Today</Text>
            <Text style={styles.weather}>☁️ +3°C</Text>
          </>
        )}
      </View>

      <View style={styles.right}>
        <View
          style={[
            styles.searchContainer,
            focused === 'search' && styles.focusedButton,
          ]}
        >
          <SearchIcon size={18} color="#fff" />

          {isSearch ? (
            <TextInput
              value={query}
              onChangeText={(text) => dispatch(setQuery(text))}
              placeholder="Поиск"
              placeholderTextColor="#888"
              style={styles.input}
              autoFocus
            />
          ) : (
            <Pressable
              style={{ flex: 1 }}
              focusable={isTV}
              onFocus={() => setFocused('search')}
              onBlur={() => setFocused(null)}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.searchPlaceholder}>
                {query ? query : 'Поиск'}
              </Text>
            </Pressable>
          )}

          <VoiceIcon size={18} color="#fff" />
        </View>

        {isSearch ? (
          <Pressable
            focusable={isTV}
            onFocus={() => setFocused('find')}
            onBlur={() => setFocused(null)}
            style={[
              styles.findButton,
              focused === 'find' && styles.focusedButton,
            ]}
          >
            <Text style={styles.findText}>Найти</Text>
          </Pressable>
        ) : (
          <Pressable
            focusable={isTV}
            onFocus={() => setFocused('avatar')}
            onBlur={() => setFocused(null)}
            style={[
              styles.avatar,
              focused === 'avatar' && styles.focusedButton,
            ]}
          >
            <UserIcon size={18} color="#fff" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },

  date: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },

  weather: {
    fontSize: 16,
    color: '#aaa',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    width: 320,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },

  searchPlaceholder: {
    color: '#888',
    fontSize: 16,
  },

  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },

  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 50,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  findButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 24,
    height: 50,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  findText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  back: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 50,
    gap: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  backText: {
    color: '#fff',
    fontSize: 16,
  },

  focusedButton: {
    borderColor: '#fff',
  },
});
