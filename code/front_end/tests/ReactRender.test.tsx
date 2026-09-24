import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

const TestComponent = () => {
  return <div>Dashboard Test</div>;
};

describe('Vitest React Render', () => {
  it('renders a React component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Dashboard Test')).toBeTruthy();
  });
});
