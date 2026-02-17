import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appSettingsStorage } from '../../../shared/lib/appSettingsStorage';
import { useAuth } from '../../../app/providers/AppProviders';

export default function ParentalControlScreen() {
  const { t } = useTranslation();
  const { resolvedTheme } = useAuth();
  const isTV = Platform.isTV;
  const isLight = resolvedTheme === 'light';

  const [enabled, setEnabled] = useState(false);
  const [pin, setPin] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const isEnabled = await appSettingsStorage.getBoolean('parentalEnabled', false);
      const savedPin = await appSettingsStorage.getString('parentalPin', '');
      setEnabled(isEnabled);
      setPin(savedPin);
    };

    load();
  }, []);

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    await appSettingsStorage.setBoolean('parentalEnabled', next);
  };

  const savePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert(t('settings.parental_control'), t('settings.pin_invalid'));
      return;
    }

    await appSettingsStorage.setString('parentalPin', pin);
    Alert.alert(t('settings.parental_control'), t('settings.pin_saved'));
  };

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <Text style={[styles.title, isLight && styles.titleLight]}>{t('settings.parental_control')}</Text>
      <Text style={[styles.subtitle, isLight && styles.subtitleLight]}>{t('settings.parental_desc')}</Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus
        onFocus={() => setFocused('enabled')}
        onBlur={() => setFocused(null)}
        onPress={toggleEnabled}
        style={[
          styles.row,
          isLight && styles.rowLight,
          focused === 'enabled' && styles.focused,
          isLight && focused === 'enabled' && styles.focusedLight,
        ]}
      >
        <Text style={[styles.label, isLight && styles.labelLight]}>{t('settings.parental_enabled')}</Text>
        <Text style={[styles.value, isLight && styles.valueLight]}>{enabled ? 'ON' : 'OFF'}</Text>
      </Pressable>

      <View style={[styles.pinBox, isLight && styles.pinBoxLight]}>
        <Text style={[styles.pinLabel, isLight && styles.pinLabelLight]}>{t('settings.parental_pin')}</Text>
        <TextInput
          value={pin}
          onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          placeholder={t('settings.parental_pin_placeholder')}
          placeholderTextColor="#7a7a7a"
          style={[styles.input, isLight && styles.inputLight]}
        />

        <Pressable
          focusable={isTV}
          onFocus={() => setFocused('save')}
          onBlur={() => setFocused(null)}
          onPress={savePin}
          style={[
            styles.saveButton,
            isLight && styles.saveButtonLight,
            focused === 'save' && styles.focused,
            isLight && focused === 'save' && styles.focusedLight,
          ]}
        >
          <Text style={[styles.saveButtonText, isLight && styles.saveButtonTextLight]}>
            {t('settings.save_pin')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  containerLight: {
    backgroundColor: '#f4f4f5',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleLight: {
    color: '#111827',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleLight: {
    color: '#4b5563',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowLight: {
    backgroundColor: '#ffffff',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedLight: {
    borderColor: '#2563eb',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  labelLight: {
    color: '#111827',
  },
  value: {
    color: '#fff',
    fontWeight: '700',
  },
  valueLight: {
    color: '#111827',
  },
  pinBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pinBoxLight: {
    backgroundColor: '#ffffff',
  },
  pinLabel: {
    color: '#fff',
    fontSize: 16,
  },
  pinLabelLight: {
    color: '#111827',
  },
  input: {
    backgroundColor: '#101010',
    borderWidth: 1,
    borderColor: '#343434',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    color: '#111827',
  },
  saveButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  saveButtonLight: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  saveButtonTextLight: {
    color: '#fff',
  },
});
