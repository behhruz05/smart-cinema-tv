import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SidebarMenu } from './SidebarMenu';
import { Header } from './Header';

export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.container}>
      <SidebarMenu />
      <View style={styles.content}>
        <Header />
        <View style={styles.screen}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#101010',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
});
