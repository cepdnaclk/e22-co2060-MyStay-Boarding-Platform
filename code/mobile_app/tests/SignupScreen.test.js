import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';

import SignupScreen from '../src/screens/SignupScreen';
import api from '../src/services/api';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../src/services/api', () => ({
  post: jest.fn(),
}));

describe('Mobile SignupScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    api.post.mockResolvedValue({
      data: {
        message: 'User registered successfully',
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('rejects an incomplete form before calling the API', async () => {
    const utils = await render(
      <SignupScreen navigation={navigation} />
    );

    await fireEvent.press(utils.getByText('Sign Up'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Error',
      expect.any(String)
    );

    expect(api.post).not.toHaveBeenCalled();
  });

  test(
    'submits a landlord registration and navigates to login after success',
    async () => {
      const utils = await render(
        <SignupScreen navigation={navigation} />
      );

      await fireEvent.press(utils.getByText('Landlord'));

      await fireEvent.changeText(
        utils.getByPlaceholderText('John Doe'),
        'Test Landlord'
      );

      await fireEvent.changeText(
        utils.getByPlaceholderText('you@example.com'),
        'landlord@example.com'
      );

      await fireEvent.changeText(
        utils.getByPlaceholderText('077-1234567'),
        '0771234567'
      );

      await fireEvent.changeText(
        utils.getByPlaceholderText('Enter your password'),
        'password123'
      );

      await fireEvent.press(utils.getByText('Sign Up'));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/auth/signup',
          {
            name: 'Test Landlord',
            email: 'landlord@example.com',
            phone: '0771234567',
            password: 'password123',
            role: 'landlord',
          }
        );
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Account created successfully! Please login.',
        expect.any(Array)
      );

      const alertCall = Alert.alert.mock.calls.find(
        (call) =>
          call[0] === 'Success' &&
          call[1] === 'Account created successfully! Please login.'
      );

      const alertButtons = alertCall[2];

      const okButton = alertButtons.find(
        (button) => button.text === 'OK'
      );

      okButton.onPress();

      expect(navigation.navigate).toHaveBeenCalledWith('Login');
    }
  );
});



