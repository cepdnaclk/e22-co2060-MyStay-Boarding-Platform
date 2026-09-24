import React, { useContext } from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import {
  Text,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  AuthContext,
  AuthProvider,
} from '../src/context/AuthContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

function TestComponent() {
  const {
    userToken,
    isLoading,
    login,
    logout,
  } = useContext(AuthContext);

  return (
    <>
      <Text testID="token">
        {userToken || 'null'}
      </Text>

      <Text testID="loading">
        {isLoading ? 'loading' : 'loaded'}
      </Text>

      <Button
        title="Login"
        onPress={() => login('new-token')}
      />

      <Button
        title="Logout"
        onPress={() => logout()}
      />
    </>
  );
}

describe('Mobile AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads an existing token from storage', async () => {
    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userToken') {
        return 'saved-token';
      }

      return null;
    });

    const utils = await render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        utils.getByTestId('token').props.children
      ).toBe('saved-token');
    });

    await waitFor(() => {
      expect(
        utils.getByTestId('loading').props.children
      ).toBe('loaded');
    });

    expect(
      AsyncStorage.getItem
    ).toHaveBeenCalledWith('userToken');
  });

  test('persists login and clears storage on logout', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(null);
    AsyncStorage.removeItem.mockResolvedValue(null);

    const utils = await render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        utils.getByTestId('loading').props.children
      ).toBe('loaded');
    });

    await fireEvent.press(
      utils.getByText('Login')
    );

    await waitFor(() => {
      expect(
        utils.getByTestId('token').props.children
      ).toBe('new-token');
    });

    expect(
      AsyncStorage.setItem
    ).toHaveBeenCalledWith(
      'userToken',
      'new-token'
    );

    await fireEvent.press(
      utils.getByText('Logout')
    );

    await waitFor(() => {
      expect(
        utils.getByTestId('token').props.children
      ).toBe('null');
    });

    expect(
      AsyncStorage.removeItem
    ).toHaveBeenCalledWith('userToken');
  });
});

