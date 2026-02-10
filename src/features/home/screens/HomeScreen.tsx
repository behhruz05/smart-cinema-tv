import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export function HomeScreen() {
  return (
    <View style={styles.root}>
      
      {/* LEFT MENU */}
      <View style={styles.menu}>
        <Text style={styles.logo}>AlloPlay</Text>

        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>🏠 Home</Text>
        </Pressable>

        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>🎬 Movies</Text>
        </Pressable>

        <Pressable style={styles.menuItem}>
          <Text style={styles.menuText}>⭐ Favorites</Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Главная</Text>
        </View>

        {/* BODY */}
        <View style={styles.body}>
          <Text style={styles.bodyText}>
            Контент будет здесь
          </Text>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#010101',
  },

  menu: {
    width: 90,
    backgroundColor: '#0b0b0b',
    alignItems: 'center',
    paddingTop: 40,
  },

  logo: {
    color: '#dc2626',
    fontWeight: '700',
    marginBottom: 40,
  },

  menuItem: {
    marginVertical: 16,
  },

  menuText: {
    color: '#fff',
    fontSize: 14,
  },

  content: {
    flex: 1,
  },

  header: {
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },

  body: {
    flex: 1,
    padding: 24,
  },

  bodyText: {
    color: '#9ca3af',
  },
});
