import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { authApi } from '../services/auth.api';
import { useAuth } from '../../../app/providers/AppProviders';
import { EyeIcon, EyeOffIcon } from '../../../shared/icons/EyeIcon';
import { fetchMe } from '../../../store/slice/auth.slice';
import { store } from '../../../store';

const Logo = require('../../../assets/imgs/Group.png');
const SplineBg = require('../../../assets/imgs/Spline.png');
const QrCode = require('../../../assets/imgs/QR-code.png');
const TV_CODE_LENGTH = 6;

export function LoginScreen() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const dispatch = store.dispatch;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<
    null | 'login' | 'password' | 'submit'
  >(null);

  const [tvCode, setTvCode] = useState<string[]>(
    Array.from({ length: TV_CODE_LENGTH }, () => ''),
  );
  const [focusedCodeIndex, setFocusedCodeIndex] =
    useState<number | null>(null);
  const codeInputRefs = useRef<Array<TextInput | null>>([]);

  const deviceInfo = {
    device_id: `TV-${Math.random().toString(36).slice(2)}`,
    device_type: 'tv' as const,
    device_name: 'Android TV',
    notification_id: null,
  };

  const detectLoginType = (
    value: string,
  ): 'phone' | 'username' => {
    if (value.startsWith('+') || /^[0-9]/.test(value)) {
      return 'phone';
    }
    return 'username';
  };

  const onCodeChange = (
    value: string,
    index: number,
  ) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...tvCode];
    next[index] = value;
    setTvCode(next);

    if (value && index < TV_CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus();
    }

    if (!value && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
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
        username:
          loginType === 'username' ? login : null,
        phone: loginType === 'phone' ? login : null,
        password,
        ...deviceInfo,
      };

      const token = await authApi.login(payload);
      await setToken(token);
      dispatch(fetchMe());
    } catch {
      setError(t('login.login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Image source={SplineBg} style={styles.spline} />

      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <View style={styles.brand}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.brandText}>Allo play</Text>
          </View>

          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>
            {t('login.subtitle')}
          </Text>

          <Image source={QrCode} style={styles.qrBox} />
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.label}>
            {t('login.phone_or_id')}
          </Text>
          <Pressable
            focusable
            onFocus={() => setFocusedField('login')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.inputWrapper,
              focusedField === 'login' &&
                styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              value={login}
              onChangeText={setLogin}
              placeholder={t('login.enter_phone')}
              placeholderTextColor="#6b7280"
            />
          </Pressable>

          <Text style={styles.label}>
            {t('login.password')}
          </Text>
          <Pressable
            focusable
            onFocus={() =>
              setFocusedField('password')
            }
            onBlur={() => setFocusedField(null)}
            style={[
              styles.inputWrapper,
              focusedField === 'password' &&
                styles.inputFocused,
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
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? (
                <EyeOffIcon size={20} color="#9ca3af" />
              ) : (
                <EyeIcon size={20} color="#9ca3af" />
              )}
            </Pressable>
          </Pressable>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            focusable
            disabled={loading}
            onPress={onLogin}
            onFocus={() => setFocusedField('submit')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.button,
              focusedField === 'submit' &&
                styles.buttonFocused,
              loading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {loading
                ? t('login.login_loading')
                : t('login.login_button')}
            </Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>
              {t('login.or_enter_code')}
            </Text>
            <View style={styles.line} />
          </View>

          <View style={styles.codeWrapper}>
            <View style={styles.codeRow}>
              {tvCode.slice(0, 3).map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    codeInputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.codeBox,
                    focusedCodeIndex === index &&
                      styles.codeBoxFocused,
                  ]}
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onFocus={() =>
                    setFocusedCodeIndex(index)
                  }
                  onBlur={() =>
                    setFocusedCodeIndex(null)
                  }
                  onChangeText={value =>
                    onCodeChange(value, index)
                  }
                />
              ))}

              <Text style={styles.dash}>-</Text>

              {tvCode.slice(3).map((digit, index) => {
                const realIndex = index + 3;
                return (
                  <TextInput
                    key={realIndex}
                    ref={ref => {
                      codeInputRefs.current[realIndex] = ref;
                    }}
                    style={[
                      styles.codeBox,
                      focusedCodeIndex ===
                        realIndex &&
                        styles.codeBoxFocused,
                    ]}
                    value={digit}
                    keyboardType="number-pad"
                    maxLength={1}
                    onFocus={() =>
                      setFocusedCodeIndex(realIndex)
                    }
                    onBlur={() =>
                      setFocusedCodeIndex(null)
                    }
                    onChangeText={value =>
                      onCodeChange(value, realIndex)
                    }
                  />
                );
              })}
            </View>

            <Text style={styles.codeHint}>
              {t('login.code_hint')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#010101',
  },
  spline: {
    position: 'absolute',
    left: 90,
    bottom: -10,
    width: 420,
    height: 420,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    width: '50%',
    justifyContent: 'center',
    paddingLeft: 60,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  brandText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginVertical: 12,
    width: 260,
  },
  qrBox: {
    width: 200,
    height: 200,
    marginTop: 30,
  },
  rightColumn: {
    width: '55%',
    justifyContent: 'center',
    paddingLeft: 120,
    paddingRight: 80,
  },
  label: {
    color: '#fff',
    marginBottom: 6,
    fontSize: 13,
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 8,
    backgroundColor: '#141414',
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: '#fff',
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingRight: 42,
    color: '#fff',
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  errorText: {
    color: '#f87171',
    marginBottom: 12,
    marginTop: -6,
  },
  button: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonFocused: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#9ca3af',
    marginHorizontal: 10,
    fontSize: 12,
  },
  codeWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  codeBox: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    color: '#fff',
    textAlign: 'center',
    fontSize: 19,
    padding: 0,
  },
  codeBoxFocused: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  dash: {
    color: '#9ca3af',
    fontSize: 22,
    marginHorizontal: 2,
  },
  codeHint: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
  },
});
