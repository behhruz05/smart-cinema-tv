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
  const isDarkMode = resolvedTheme === 'dark';

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
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{t('settings.parental_control')}</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>{t('settings.parental_desc')}</Text>

      <Pressable
        focusable={isTV}
        hasTVPreferredFocus
        onFocus={() => setFocused('enabled')}
        onBlur={() => setFocused(null)}
        onPress={toggleEnabled}
        style={[
          styles.row,
          isDarkMode && styles.rowDark,
          focused === 'enabled' && styles.focused,
          isDarkMode && focused === 'enabled' && styles.focusedDark,
        ]}
      >
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>{t('settings.parental_enabled')}</Text>
        <Text style={[styles.value, isDarkMode && styles.valueDark]}>{enabled ? 'ON' : 'OFF'}</Text>
      </Pressable>

      <View style={[styles.pinBox, isDarkMode && styles.pinBoxDark]}>
        <Text style={[styles.pinLabel, isDarkMode && styles.pinLabelDark]}>{t('settings.parental_pin')}</Text>
        <TextInput
          value={pin}
          onChangeText={(v) => setPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          placeholder={t('settings.parental_pin_placeholder')}
          placeholderTextColor="#7a7a7a"
          style={[styles.input, isDarkMode && styles.inputDark]}
        />

        <Pressable
          focusable={isTV}
          onFocus={() => setFocused('save')}
          onBlur={() => setFocused(null)}
          onPress={savePin}
          style={[
            styles.saveButton,
            isDarkMode && styles.saveButtonDark,
            focused === 'save' && styles.focused,
            isDarkMode && focused === 'save' && styles.focusedDark,
          ]}
        >
          <Text style={[styles.saveButtonText, isDarkMode && styles.saveButtonTextDark]}>
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
  containerDark: {
    backgroundColor: '#111111',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 8,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    color: '#a3a3a3',
    marginBottom: 20,
  },
  subtitleDark: {
    color: '#a1a1a1',
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
  rowDark: {
    backgroundColor: '#181818',
  },
  focused: {
    borderColor: '#fff',
  },
  focusedDark: {
    borderColor: '#ffffff',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    paddingRight: 12,
  },
  labelDark: {
    color: '#ffffff',
  },
  value: {
    color: '#fff',
    fontWeight: '700',
  },
  valueDark: {
    color: '#ffffff',
  },
  pinBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pinBoxDark: {
    backgroundColor: '#181818',
  },
  pinLabel: {
    color: '#fff',
    fontSize: 16,
  },
  pinLabelDark: {
    color: '#ffffff',
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
  inputDark: {
    backgroundColor: '#141414',
    borderColor: '#2f2f2f',
    color: '#ffffff',
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
  saveButtonDark: {
    backgroundColor: '#2c2c2c',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  saveButtonTextDark: {
    color: '#fff',
  },
});
