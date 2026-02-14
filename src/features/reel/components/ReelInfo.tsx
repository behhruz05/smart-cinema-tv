import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Reel } from '../../../service/reel.service';

export function ReelInfo({ reel }: { reel: Reel }) {
  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{reel.title_ru}</Text>
          <Text style={styles.subtitle} numberOfLines={3}>
            {reel.description_ru}
          </Text>
        </View>
      </View>

      <Pressable style={styles.watchBtn}>
        <Text style={styles.watchText}>▶ Смотреть фильм</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#bbb',
    fontSize: 12,
    marginTop: 4,
  },
  watchBtn: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  watchText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
