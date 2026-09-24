import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';

import { Text, Pressable } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../src/screens/HomeScreen';
import api from '../src/services/api';

jest.mock('../src/services/api', () => ({
  get: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    useFocusEffect: (callback) => {
      React.useEffect(() => {
        callback();
      }, []);
    },
  };
});

/*
 * Mock the icons so that the test can interact with
 * the profile icon without changing HomeScreen.js.
 */
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  const createIcon = (name) => {
    return function MockIcon(props) {
      return (
        <Pressable
          testID={`mock-icon-${name}`}
          onPress={props.onPress}
        >
          <Text>{name}</Text>
        </Pressable>
      );
    };
  };

  return new Proxy(
    {},
    {
      get: (target, property) => {
        if (property === '__esModule') {
          return true;
        }

        return createIcon(String(property));
      },
    }
  );
});

describe('Mobile HomeScreen', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userToken') {
        return null;
      }

      if (key === 'userData') {
        return null;
      }

      return null;
    });

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Campus View Boarding',
          address: 'Peradeniya',
          location: 'Peradeniya',
          price: 25000,
          facilities: 'WiFi, Parking',
        },
        {
          id: 2,
          title: 'City Boarding House',
          address: 'Kandy',
          location: 'Kandy',
          price: 30000,
          facilities: 'WiFi',
        },
      ],
    });
  });

  test('loads and displays boarding listings', async () => {
    render(
      <HomeScreen navigation={navigation} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Campus View Boarding')
      ).toBeTruthy();

      expect(
        screen.getByText('City Boarding House')
      ).toBeTruthy();
    });

    expect(api.get).toHaveBeenCalledWith('/stays');
  });

  test('filters listings using the search field', async () => {
    render(
      <HomeScreen navigation={navigation} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Campus View Boarding')
      ).toBeTruthy();

      expect(
        screen.getByText('City Boarding House')
      ).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search by title or location...'
    );

    fireEvent.changeText(
      searchInput,
      'Campus'
    );

    await waitFor(() => {
      expect(
        screen.getByText('Campus View Boarding')
      ).toBeTruthy();

      expect(
        screen.queryByText('City Boarding House')
      ).toBeNull();
    });
  });

  test('navigates to Login when an unauthenticated user presses the profile button', async () => {
    render(
      <HomeScreen navigation={navigation} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('Browse Boarding Places')
      ).toBeTruthy();
    });

    /*
     * Find the profile icon created by the lucide-react-native
     * mock. HomeScreen uses UserRound for the profile button.
     */
    const profileIcon = screen.getByTestId(
      'mock-icon-User'
    );

    expect(profileIcon).toBeTruthy();

    fireEvent.press(profileIcon);

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Login'
    );
  });
});

