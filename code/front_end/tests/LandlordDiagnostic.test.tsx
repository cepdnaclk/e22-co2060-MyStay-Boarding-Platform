import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  useMapEvents: () => ({}),
}));

vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  }),
);

import { LandlordDashboard } from '../src/app/pages/LandlordDashboard';

describe('Landlord Dashboard Diagnostic', () => {
  it('renders the dashboard', () => {
    render(<LandlordDashboard />);

    expect(screen.getByText('Landlord Dashboard')).toBeTruthy();
  });
});
