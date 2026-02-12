import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface SectionProps<T> {
  title: string;
  data?: T[];
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Section<T>({
  title,
  data,
  children,
  style,
}: SectionProps<T>) {
  if (!data || data.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
});
