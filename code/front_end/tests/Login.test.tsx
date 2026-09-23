import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Login } from '../src/app/pages/Login';

const navigate = vi.fn();

vi.mock('react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: () => navigate,
}));

vi.mock('lucide-react', () => ({
  Mail: () => <span aria-hidden="true" />,
  Lock: () => <span aria-hidden="true" />,
  ArrowRight: () => <span aria-hidden="true" />,
}));

describe('Frontend Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal('alert', vi.fn());
  });

  it('submits credentials, stores the session and redirects a landlord', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: 'test-token',
        user: { id: 7, name: 'Landlord One', role: 'landlord' },
      }),
    }));

    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'landlord@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/landlord-dashboard'));
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      id: 7,
      name: 'Landlord One',
      role: 'landlord',
    });
  });

  it('shows the backend error when login fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid email or password' }),
    }));

    render(<Login />);
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: /sign in/i })[0]);

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Invalid email or password'));
    expect(navigate).not.toHaveBeenCalled();
  });
});
