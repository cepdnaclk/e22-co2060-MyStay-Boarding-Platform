import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { LandlordDashboard } from '../src/app/pages/LandlordDashboard';

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

describe('Frontend Landlord Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/stays/landlord/my-listings')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                stay_id: 1,
                title: 'Test Boarding',
                address: 'Peradeniya',
                price: 25000,
                facilities: 'WiFi, Parking',
                availability: 'Available',
                roomType: 'Single',
                gender: 'Any',
              },
            ],
          });
        }

        if (url.includes('/api/bookings/landlord/')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }

        if (url.includes('/api/messages/landlord/')) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('loads listings and displays the dashboard', async () => {
    render(<LandlordDashboard />);

    expect(screen.getByText('Landlord Dashboard')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/My Listings \(1\)/)).toBeTruthy();
    });

    const listingsButton = screen.getByRole('button', {
      name: /My Listings \(1\)/,
    });

    listingsButton.click();

    await waitFor(() => {
      expect(screen.getByText('Test Boarding')).toBeTruthy();
    });

    expect(screen.getByText('Peradeniya')).toBeTruthy();
    expect(screen.getByText(/Rs\. 25,000\/mo/)).toBeTruthy();
  });
});
