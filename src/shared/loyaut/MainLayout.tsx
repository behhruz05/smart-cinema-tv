import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SidebarMenu } from './SidebarMenu';
import { Header } from './Header';
import { useAuth } from '../../app/providers/AppProviders';

export function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useAuth();
  const isLight = resolvedTheme === 'light';

  return (
    <View
      style={[
        styles.container,
        isLight && { backgroundColor: '#f4f4f5' },
      ]}
    >
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
