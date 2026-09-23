import { describe, it, expect } from 'vitest';
import { LandlordDashboard } from '../src/app/pages/LandlordDashboard';

describe('Landlord Dashboard import', () => {
  it('can import the dashboard', () => {
    expect(LandlordDashboard).toBeDefined();
  });
});
