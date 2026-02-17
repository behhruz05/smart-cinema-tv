import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useAuth } from '../../../app/providers/AppProviders';
import { WarningIcon } from '../../../shared/icons/WarningIcon';

interface Props {
  onCancel: () => void;
}

export default function LogoutModal({ onCancel }: Props) {
  const { logout } = useAuth();
  const isTV = Platform.isTV;

  const [focused, setFocused] = useState<string | null>('cancel');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
              <WarningIcon size={50}/>
        <Text style={styles.title}>Оплата прошла успешно</Text>
        <Text style={styles.subtitle}>Доступ к фильму открыт. Приятного просмотра</Text>

        <View style={styles.row}>
          {/* CANCEL */}
          <Pressable
            focusable={isTV}
            hasTVPreferredFocus
            onFocus={() => setFocused('cancel')}
            onBlur={() => setFocused(null)}
            onPress={onCancel}
            style={[
              styles.cancelButton,
              focused === 'cancel' && styles.focused,
            ]}
          >
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>

          {/* LOGOUT */}
          <Pressable
            focusable={isTV}
            onFocus={() => setFocused('logout')}
            onBlur={() => setFocused(null)}
            onPress={handleLogout}
            style={[
              styles.logoutButton,
              focused === 'logout' && styles.focused,
            ]}
          >
            <Text style={styles.logoutText}>Выйти</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 500,
    backgroundColor: '#1b1b1b',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
    marginTop: 30,

  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
borderColor: 'transparent'

  },
  icon: {
    fontSize: 40,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#EA0000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
borderColor: 'transparent'
  },
  cancelText: {
    color: '#fff',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
  focused: {
    borderColor: '#fff',
  },
  subtitle: {
fontSize: 16,
color: "#A1A1A1",
    marginBottom: 30,

  },

});
