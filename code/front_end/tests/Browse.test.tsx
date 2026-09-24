import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';

import { Browse } from '../src/app/pages/Browse';

vi.mock('react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => ({}),
}));

describe('Frontend Browse', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            stay_id: 1,
            title: 'Green View Room',
            address: 'Peradeniya',
            price: 9000,
            facilities: 'WiFi, Kitchen',
            availability: 'Available',
            roomType: 'Single',
            gender: 'Any',
            latitude: '7.25',
            longitude: '80.59',
          },
          {
            stay_id: 2,
            title: 'Campus Double Room',
            address: 'Kandy',
            price: 16000,
            facilities: 'Parking',
            availability: 'Not Available',
            roomType: 'Double',
            gender: 'Female',
            latitude: '7.29',
            longitude: '80.63',
          },
        ],
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('loads listings and filters them by title/location', async () => {
    render(<Browse />);

    await waitFor(() => {
      expect(screen.getByText('Green View Room')).toBeTruthy();
    });

    expect(screen.getByText('Campus Double Room')).toBeTruthy();

    const searchInput = screen.getByPlaceholderText(
      /Search by title or location/i,
    );

    fireEvent.change(searchInput, {
      target: { value: 'Peradeniya' },
    });

    await waitFor(() => {
      expect(screen.getByText('Green View Room')).toBeTruthy();
      expect(screen.queryByText('Campus Double Room')).not.toBeTruthy();
    });
  });
});