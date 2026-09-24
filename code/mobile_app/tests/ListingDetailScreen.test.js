import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ListingDetailScreen from '../src/screens/ListingDetailScreen';
import api from '../src/services/api';

jest.mock('../src/services/api', () => ({
  get: jest.fn(),
}));

describe('Mobile ListingDetailScreen', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays a listing from the backend', async () => {
    api.get.mockResolvedValue({
      data: {
        id: 5,
        title: 'Campus View',
        name: 'Campus View',
        address: 'Peradeniya',
        location: 'Peradeniya',
        price: 15000,
        description: 'Comfortable boarding place near campus.',
        facilities: 'WiFi,Parking',
      },
    });

    const route = {
      params: {
        id: 5,
      },
    };

    const utils = await render(
      <ListingDetailScreen
        navigation={navigation}
        route={route}
      />
    );

    await waitFor(() => {
      expect(
        utils.getByText('Campus View')
      ).toBeTruthy();
    });

    expect(api.get).toHaveBeenCalledWith('/stays/5');
  });

  test('shows a not-found state when the API fails', async () => {
    api.get.mockRejectedValue(
      new Error('Not found')
    );

    const route = {
      params: {
        id: 999,
      },
    };

    const utils = await render(
      <ListingDetailScreen
        navigation={navigation}
        route={route}
      />
    );

    await waitFor(() => {
      expect(
        utils.getByText('Stay not found')
      ).toBeTruthy();
    });

    expect(api.get).toHaveBeenCalledWith('/stays/999');
  });
});

