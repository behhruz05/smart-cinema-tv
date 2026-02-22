/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({ children }: { children: any }) => children,
  };
});

jest.mock('../src/app/providers/AppProviders', () => {
  return {
    AppProviders: ({ children }: { children: any }) => children,
  };
});

jest.mock('../src/app/navigation/RootNavigator', () => {
  const { Text } = require('react-native');
  return {
    RootNavigator: () => <Text>RootNavigator</Text>,
  };
});

jest.mock('../src/i18n', () => ({
  initI18n: jest.fn().mockResolvedValue(undefined),
}));

test('renders correctly', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

  expect(tree!).toBeTruthy();
});
