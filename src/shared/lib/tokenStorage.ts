import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'APP_TOKEN';

export const tokenStorage = {
  async get() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async set(token: string) {
    return AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async remove() {
    return AsyncStorage.removeItem(TOKEN_KEY);
  },
};
