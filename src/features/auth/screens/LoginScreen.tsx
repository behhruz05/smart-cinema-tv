import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';

import { authApi } from '../services/auth.api';
import { useAuth } from '../../../app/providers/AppProviders';

import { InfoIcon } from '../../../shared/icons/InfoIcon';
import { EyeIcon, EyeOffIcon } from '../../../shared/icons/EyeIcon';

const Logo = require('../../../assets/imgs/Group.png');
const SplineBg = require('../../../assets/imgs/Spline.png');
const QrCode = require('../../../assets/imgs/QR-code.png');

export function LoginScreen() {
  const { setToken } = useAuth();

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
    if (/^[0-9+]*$/.test(text) || !/^[0-9]/.test(text)) {
      setLogin(text);
      setError('');
    }
  };

  const onLogin = async () => {
    if (!login || !password) {
      setError('Заполните все поля');
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

      const res = await authApi.login(payload);

      // 🔥 SHU YER — Home ochiladi
      setToken(res.token);

    } catch (e: any) {
      setError(e.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image source={SplineBg} style={styles.spline} />

      <View style={styles.container}>
        <View style={styles.left}>
          <View style={styles.titles}>
            <View style={styles.brand}>
              <Image source={Logo} style={styles.logo} />
              <Text style={styles.brandText}>Allo play</Text>
            </View>
            <Text style={styles.title}>Вход в аккаунт</Text>
            <Text style={styles.subtitle}>
              Отсканируйте QR-код или войдите с помощью логина
            </Text>
          </View>

          <View style={styles.qrWrapper}>
            <Image source={QrCode} style={styles.qrBox} />
          </View>
        </View>

        <View style={styles.right}>
          <View style={styles.field}>
            <Text style={styles.label}>Телефон или Abonent ID</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  error && { borderColor: '#f87171' },
                ]}
                value={login}
                onChangeText={handleLoginChange}
                placeholder="Введите телефон или ID"
                placeholderTextColor="#6b7280"
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View style={styles.field}>
            <Text style={styles.label}>Пароль</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  error && { borderColor: '#f87171' },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.iconRight}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color="#9ca3af" />
                ) : (
                  <EyeIcon size={20} color="#9ca3af" />
                )}
              </Pressable>
            </View>
          </View>


          {error ? <View style={styles.errorView}>
            <InfoIcon size={18} color="#f87171" />
                  <Text style={styles.error}>{error}</Text> 
          </View> : null}

          <Pressable
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={onLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Вход...' : 'Войти'}
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
  titles: { marginBottom: 68 },
  error: { color: '#f87171', fontSize: 12, marginBottom: 8 },
  left: { width: '40%', justifyContent: 'center', paddingLeft: 24 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 20, resizeMode: 'contain', marginRight: 4 },
  brandText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  qrWrapper: { marginTop: 32 },
  qrBox: {
    width: 200,
    height: 200,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  title: { color: '#fff', fontSize: 30, fontWeight: '600', marginBottom: 6 },
  subtitle: { color: '#9ca3af', fontSize: 14, marginBottom: 22, width: 230 },
  right: {
    width: '55%',
    justifyContent: 'center',
    marginLeft: 90,
    paddingHorizontal: 100,
  },
  field: { marginBottom: 18 },
  label: { color: '#fff', fontSize: 13, marginBottom: 6 },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

 input: {
  borderWidth: 1,
  borderRadius: 4,
  padding: 12,
  paddingRight: 42,
  color: '#fff',
  backgroundColor: '#141414',
  fontSize: 12,
},

inputActive: {
  borderColor: '#ffffff',
},

 
  errorView: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4
  },

  iconRight: {
    position: 'absolute',
    right: 12,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
