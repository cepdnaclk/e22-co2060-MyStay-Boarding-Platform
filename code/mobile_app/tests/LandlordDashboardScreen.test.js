import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandlordDashboardScreen from '../src/screens/LandlordDashboardScreen';
import api from '../src/services/api';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../src/services/api', () => ({
  get: jest.fn(),
}));

describe('Mobile LandlordDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    AsyncStorage.getItem.mockImplementation(async (key) => {
      if (key === 'userData') {
        return JSON.stringify({
          id: 10,
          name: 'Test Landlord',
          email: 'landlord@example.com',
          role: 'landlord',
        });
      }

      if (key === 'userToken') {
        return 'test-token';
      }

      return null;
    });

    api.get.mockImplementation(async (url) => {
      if (url === '/stays/landlord/my-listings') {
        return {
          data: [
            {
              id: 1,
              title: 'Campus View Boarding',
              price: 15000,
            },
            {
              id: 2,
              title: 'City Boarding House',
              price: 18000,
            },
          ],
        };
      }

      if (url === '/bookings/landlord/10') {
        return {
          data: [
            {
              id: 101,
              status: 'pending',
            },
            {
              id: 102,
              status: 'approved',
            },
          ],
        };
      }

      return {
        data: [],
      };
    });
  });

  test('loads landlord listings and bookings and displays their counts', async () => {
    const utils = await render(
      <LandlordDashboardScreen />
    );

    await waitFor(() => {
      expect(
        utils.getByText('Landlord Dashboard')
      ).toBeTruthy();
    });

    expect(api.get).toHaveBeenCalledWith(
      '/stays/landlord/my-listings'
    );

    expect(api.get).toHaveBeenCalledWith(
      '/bookings/landlord/10'
    );

    await waitFor(() => {
      expect(
        utils.getByText('Campus View Boarding')
      ).toBeTruthy();

      expect(
        utils.getByText('City Boarding House')
      ).toBeTruthy();
    });
  });
});

