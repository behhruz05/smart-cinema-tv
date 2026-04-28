import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';

import { authApi } from '../services/auth.api';
import { useAuth } from '../../../app/providers/AppProviders';
import { EyeIcon, EyeOffIcon } from '../../../shared/icons/EyeIcon';
import { fetchMe } from '../../../store/slice/auth.slice';
import { store } from '../../../store';
import { deviceStorage } from '../../../shared/lib/deviceStorage';
import { changeAppLanguage, normalizeAppLanguage } from '../../../i18n';

const Logo = require('../../../assets/imgs/Group.png');
const SplineBg = require('../../../assets/imgs/Spline.png');
const QrCenterLogo = require('../../../assets/imgs/QrCode.png');

const TV_CODE_LENGTH = 6;
const TV_SESSION_FALLBACK_EXPIRES_SECONDS = 600;
const TV_SESSION_REFRESH_EARLY_MS = 5000;
const globalWithIdleCallbacks = globalThis as typeof globalThis & {
  requestIdleCallback?: (cb: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

type SessionState = 'loading' | 'pending' | 'expired' | 'error';

interface TVSession {
  session_id: string;
  code: string;
  qr_data: string;
  expires_in: number;
}

export function LoginScreen() {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const dispatch = store.dispatch;
  const isTV = Platform.isTV;

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<
    null | 'login' | 'password' | 'submit'
  >(null);

  // TV session
  const [session, setSession] = useState<TVSession | null>(null);
  const [sessionState, setSessionState] =
    useState<SessionState>('loading');

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const sessionRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const deviceIdRef = useRef<string>('');
  const loginInputRef = useRef<TextInput | null>(null);
  const passwordInputRef = useRef<TextInput | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const clearSessionRefreshTimer = useCallback(() => {
    if (sessionRefreshTimerRef.current) {
      clearTimeout(sessionRefreshTimerRef.current);
      sessionRefreshTimerRef.current = null;
    }
  }, []);

  const dismissKeyboardCompletely = useCallback(() => {
    loginInputRef.current?.blur();
    passwordInputRef.current?.blur();
    Keyboard.dismiss();

    // Some Android TV devices keep IME visible through route changes.
    if (typeof globalWithIdleCallbacks.requestIdleCallback === 'function') {
      globalWithIdleCallbacks.requestIdleCallback(() => {
        Keyboard.dismiss();
      });
      return;
    }

    setTimeout(() => {
      Keyboard.dismiss();
    }, 0);
  }, []);

  const createSession = useCallback(async () => {
    setSessionState('loading');
    setSession(null);
    stopPolling();
    clearSessionRefreshTimer();
    try {
      const deviceId = await deviceStorage.getOrCreate();
      deviceIdRef.current = deviceId;
      const data = await authApi.createTVSession(deviceId, 'Android TV');
      setSession(data);
      setSessionState('pending');

      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await authApi.checkTVStatus(data.session_id);
          if (status.status === 'confirmed' && status.tokens) {
            stopPolling();
            clearSessionRefreshTimer();
            dismissKeyboardCompletely();
            await setToken(status.tokens.access_token);
            const user = await dispatch(fetchMe()).unwrap();
            await changeAppLanguage(normalizeAppLanguage(user?.language));
          } else if (status.status === 'expired') {
            stopPolling();
            setSessionState('expired');
          }
        } catch {
          // ignore transient poll errors
        }
      }, 4000);
    } catch {
      setSessionState('error');
    }
  }, [
    clearSessionRefreshTimer,
    dismissKeyboardCompletely,
    dispatch,
    setToken,
    stopPolling,
  ]);

  useEffect(() => {
    if (sessionState !== 'pending' || !session) return;

    const expiresInSeconds =
      Number.isFinite(session.expires_in) && session.expires_in > 0
        ? session.expires_in
        : TV_SESSION_FALLBACK_EXPIRES_SECONDS;
    const refreshInMs = Math.max(
      15000,
      expiresInSeconds * 1000 - TV_SESSION_REFRESH_EARLY_MS,
    );

    clearSessionRefreshTimer();
    sessionRefreshTimerRef.current = setTimeout(() => {
      createSession();
    }, refreshInMs);

    return () => {
      clearSessionRefreshTimer();
    };
  }, [
    clearSessionRefreshTimer,
    createSession,
    session,
    sessionState,
  ]);

  useEffect(() => {
    dismissKeyboardCompletely();
  }, [dismissKeyboardCompletely]);

  useEffect(() => {
    createSession();
    return () => {
      stopPolling();
      clearSessionRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const detectLoginType = (
    value: string,
  ): 'phone' | 'username' => {
    if (value.startsWith('+') || /^[0-9]/.test(value)) {
      return 'phone';
    }
    return 'username';
  };

  const onLogin = async () => {
    dismissKeyboardCompletely();

    if (!login || !password) {
      setError(t('login.fill_fields'));
      return;
    }

    const loginType = detectLoginType(login);
    setLoading(true);
    setError('');

    try {
      const deviceId =
        deviceIdRef.current || (await deviceStorage.getOrCreate());
      const payload = {
        login_type: loginType,
        username: loginType === 'username' ? login : null,
        phone: loginType === 'phone' ? login : null,
        password,
        device_id: deviceId,
        device_type: 'tv' as const,
        device_name: 'Android TV',
        notification_id: null,
      };

      const token = await authApi.login(payload);
      await setToken(token);
      const user = await dispatch(fetchMe()).unwrap();
      await changeAppLanguage(normalizeAppLanguage(user?.language));
      dismissKeyboardCompletely();
    } catch {
      setError(t('login.login_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      dismissKeyboardCompletely();
    };
  }, [dismissKeyboardCompletely]);

  // Split session.code into individual digits for display
  const codeDigits = session?.code
    ? session.code.split('')
    : Array(TV_CODE_LENGTH).fill('');

  const renderQrSection = () => {
    if (sessionState === 'loading') {
      return (
        <View style={styles.qrBox}>
          <ActivityIndicator size="large" color="#dc2626" />
        </View>
      );
    }

    if (sessionState === 'expired' || sessionState === 'error') {
      return (
        <Pressable
          focusable={isTV}
          onPress={createSession}
          style={styles.qrBox}>
          <Text style={styles.qrRetryText}>
            {sessionState === 'expired'
              ? t('login.session_expired')
              : t('login.session_error')}
          </Text>
          <Text style={styles.qrRetryHint}>{t('login.refresh')}</Text>
        </Pressable>
      );
    }

    if (session?.qr_data) {
      return (
        <View style={styles.qrBox}>
          <QRCode
            value={session.qr_data}
            size={176}
            color="#000000"
            backgroundColor="#ffffff"
            logo={QrCenterLogo}
            logoSize={44}
            logoMargin={8}
            logoBackgroundColor="#ffffff"
            logoBorderRadius={10}
          />
        </View>
      );
    }

    return (
      <View style={styles.qrBox}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
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

          {renderQrSection()}
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.label}>
            {t('login.phone_or_id')}
          </Text>
          <Pressable
            focusable={isTV}
            onFocus={() => setFocusedField('login')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.inputWrapper,
              focusedField === 'login' && styles.inputFocused,
            ]}>
            <TextInput
              ref={loginInputRef}
              style={styles.input}
              value={login}
              onChangeText={setLogin}
              placeholder={t('login.enter_phone')}
              placeholderTextColor={
                focusedField === 'login' ? '#ffffff' : '#6b7280'
              }
            />
          </Pressable>

          <Text style={styles.label}>
            {t('login.password')}
          </Text>
          <Pressable
            focusable={isTV}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.inputWrapper,
              focusedField === 'password' && styles.inputFocused,
            ]}>
            <TextInput
              ref={passwordInputRef}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.enter_password')}
              placeholderTextColor={
                focusedField === 'password' ? '#ffffff' : '#6b7280'
              }
              secureTextEntry={!showPassword}
            />
            <Pressable
              focusable={false}
              style={styles.iconRight}
              onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOffIcon
                  size={20}
                  color={
                    focusedField === 'password'
                      ? '#ffffff'
                      : '#9ca3af'
                  }
                />
              ) : (
                <EyeIcon
                  size={20}
                  color={
                    focusedField === 'password'
                      ? '#ffffff'
                      : '#9ca3af'
                  }
                />
              )}
            </Pressable>
          </Pressable>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            focusable={isTV}
            disabled={loading}
            onPress={onLogin}
            onFocus={() => setFocusedField('submit')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.button,
              focusedField === 'submit' && styles.buttonFocused,
              loading && styles.buttonDisabled,
            ]}>
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
              {codeDigits.slice(0, 3).map((digit, index) => (
                <View key={index} style={styles.codeBox}>
                  <Text style={styles.codeBoxText}>{digit}</Text>
                </View>
              ))}

              <Text style={styles.dash}>-</Text>

              {codeDigits.slice(3).map((digit, index) => (
                <View key={index + 3} style={styles.codeBox}>
                  <Text style={styles.codeBoxText}>{digit}</Text>
                </View>
              ))}
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrRetryText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    
  },
  qrRetryHint: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
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
    height: 52,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: '#fff',
  },
  input: {
    height: 48,
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 0,
    paddingHorizontal: 14,
    paddingRight: 42,
    color: '#fff',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
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
    borderWidth: 2,
    borderColor: 'transparent',
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
    borderWidth: 2,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
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
