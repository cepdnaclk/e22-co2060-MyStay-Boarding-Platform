import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../src/screens/LoginScreen';
import api from '../src/services/api';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../src/services/api', () => ({
  post: jest.fn(),
}));

describe('Mobile LoginScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    api.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: {
          id: 1,
          name: 'Test Landlord',
          email: 'landlord@example.com',
          role: 'landlord',
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('validates empty credentials', async () => {
    const utils = await render(
      <LoginScreen navigation={navigation} />
    );

    await fireEvent.press(utils.getByText('Sign In'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      'Please enter email and password'
    );

    expect(api.post).not.toHaveBeenCalled();
  });

  test(
    'logs in, stores credentials and navigates to the dashboard for a landlord',
    async () => {
      const utils = await render(
        <LoginScreen navigation={navigation} />
      );

      await fireEvent.changeText(
        utils.getByPlaceholderText('you@example.com'),
        'landlord@example.com'
      );

      await fireEvent.changeText(
        utils.getByPlaceholderText('Enter your password'),
        'password123'
      );

      await fireEvent.press(utils.getByText('Sign In'));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/auth/login',
          {
            email: 'landlord@example.com',
            password: 'password123',
          }
        );
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'userToken',
          'test-token'
        );
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userData',
        JSON.stringify({
          id: 1,
          name: 'Test Landlord',
          email: 'landlord@example.com',
          role: 'landlord',
        })
      );

      await waitFor(() => {
        expect(navigation.replace).toHaveBeenCalledWith(
          'LandlordDashboard'
        );
      });
    }
  );
});

