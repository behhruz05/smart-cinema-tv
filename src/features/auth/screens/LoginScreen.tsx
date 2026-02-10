import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';

const Logo = require('../../../assets/imgs/Group.png');

export function LoginScreen() {
  return (
    <View style={styles.container}>
      {/* LEFT */}
      <View style={styles.left}>
        <View style={styles.brand}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.brandText}>Allo play</Text>
        </View>

        <View style={styles.qrBox}>
          <Text style={styles.qrText}>QR CODE</Text>
        </View>

        <Text style={styles.qrHint}>
          Scan QR code with your phone to sign in
        </Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <Text style={styles.title}>Вход в аккаунт</Text>
        <Text style={styles.subtitle}>Введите данные для входа</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#777"
          secureTextEntry
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Войти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#010101',
  },

  left: {
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    alignItems: 'center',
    marginBottom: 24,
  },

  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 8,
  },

  brandText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },

  qrBox: {
    width: 224,
    height: 224,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrText: {
    color: '#000',
    fontSize: 14,
  },

  qrHint: {
    marginTop: 16,
    paddingHorizontal: 24,
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },

  right: {
    width: '55%',
    justifyContent: 'center',
    paddingHorizontal: 64,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
  },

  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 32,
  },

  input: {
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    marginBottom: 16,
  },

  button: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
