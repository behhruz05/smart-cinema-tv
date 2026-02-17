import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { authApi } from '../services/auth.api';
import { useAuth } from '../../../app/providers/AppProviders';
import { InfoIcon } from '../../../shared/icons/InfoIcon';
import { EyeIcon, EyeOffIcon } from '../../../shared/icons/EyeIcon';
import { fetchMe } from '../../../store/slice/atuh.slice';
import { store } from '../../../store';

const Logo = require('../../../assets/imgs/Group.png');
const SplineBg = require('../../../assets/imgs/Spline.png');
const QrCode = require('../../../assets/imgs/QR-code.png');

export function LoginScreen() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const dispatch = store.dispatch;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const DEVICE_INFO = {
    device_id: 'TV-' + Math.random().toString(36).slice(2),
    device_type: 'tv' as const,
    device_name: 'Android TV',
    notification_id: null,
  };

  const detectLoginType = (value: string): 'phone' | 'username' => {
    if (value.startsWith('+') || /^[0-9]/.test(value)) return 'phone';
    return 'username';
  };

  const handleLoginChange = (text: string) => {
    setLogin(text);
    setError('');
  };

  const onLogin = async () => {
    if (!login || !password) {
      setError(t('login.fill_fields'));
      return;
    }

    const loginType = detectLoginType(login);

    setLoading(true);
    setError('');

    try {
      const payload = {
        login_type: loginType,
        username: loginType === 'username' ? login : null,
        phone: loginType === 'phone' ? login : null,
        password,
        ...DEVICE_INFO,
      };

      const token = await authApi.login(payload);
      await setToken(token);
      dispatch(fetchMe());
    } catch (e: any) {
      setError(t(e.message) || t('login.login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image source={SplineBg} style={styles.spline} />

      <View style={styles.container}>
        {/* LEFT */}
        <View style={styles.left}>
          <View style={styles.titles}>
            <View style={styles.brand}>
              <Image source={Logo} style={styles.logo} />
              <Text style={styles.brandText}>Allo play</Text>
            </View>

            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>
              {t('login.subtitle')}
            </Text>
          </View>

          <View style={styles.qrWrapper}>
            <Image source={QrCode} style={styles.qrBox} />
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.right}>
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('login.phone_or_id')}
            </Text>

            <Pressable
              focusable
              style={({ focused }) => [
                styles.inputWrapper,
                focused && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                value={login}
                onChangeText={handleLoginChange}
                placeholder={t('login.enter_phone')}
                placeholderTextColor="#6b7280"
              />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              {t('login.password')}
            </Text>

            <Pressable
              focusable
              style={({ focused }) => [
                styles.inputWrapper,
                focused && styles.inputFocused,
              ]}
            >
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('login.enter_password')}
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
              />

              <Pressable
                focusable={false}
                style={styles.iconRight}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color="#9ca3af" />
                ) : (
                  <EyeIcon size={20} color="#9ca3af" />
                )}
              </Pressable>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorView}>
              <InfoIcon size={18} color="#f87171" />
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            focusable
            onPress={onLogin}
            disabled={loading}
            style={({ focused }) => [
              styles.button,
              focused && styles.buttonFocused,
              loading && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.buttonText}>
              {loading
                ? t('login.login_loading')
                : t('login.login_button')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#010101' },

  spline: {
    position: 'absolute',
    left: 90,
    bottom: -10,
    width: 420,
    height: 420,
    resizeMode: 'contain',
  },

  container: { flex: 1, flexDirection: 'row' },

  left: {
    width: '40%',
    justifyContent: 'center',
    paddingLeft: 24,
  },

  titles: { marginBottom: 68 },

  brand: { flexDirection: 'row', alignItems: 'center' },

  logo: {
    width: 20,
    resizeMode: 'contain',
    marginRight: 4,
  },

  brandText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },

  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
    marginBottom: 6,
  },

  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 22,
    width: 230,
  },

  qrWrapper: { marginTop: 32 },

  qrBox: {
    width: 200,
    height: 200,
    borderRadius: 16,
    resizeMode: 'contain',
  },

  right: {
    width: '55%',
    justifyContent: 'center',
    marginLeft: 90,
    paddingHorizontal: 100,
  },

  field: { marginBottom: 18 },

  label: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 6,
  },

  inputWrapper: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    backgroundColor: '#141414',
  },

  inputFocused: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },

  input: {
    padding: 12,
    paddingRight: 42,
    color: '#fff',
    fontSize: 14,
  },

  iconRight: {
    position: 'absolute',
    right: 12,
    top: 14,
  },

  errorView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  error: {
    color: '#f87171',
    fontSize: 12,
  },

  button: {
    marginTop: 6,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },

  buttonFocused: {
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#b91c1c',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
