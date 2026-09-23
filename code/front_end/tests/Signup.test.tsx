import React from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { Signup } from '../src/app/pages/Signup';

const navigate = vi.fn();

vi.mock('react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useNavigate: () => navigate,
}));

vi.mock('lucide-react', () => ({
  Mail: () => <span />,
  Lock: () => <span />,
  User: () => <span />,
  Phone: () => <span />,
  ArrowRight: () => <span />,
  GraduationCap: () => <span />,
  Home: () => <span />,
  Briefcase: () => <span />,
}));

describe('Frontend Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test Student' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'student@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '0771234567' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret123' },
    });

    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'secret123' },
    });
  };

  it('prevents submission when passwords do not match', async () => {
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => {});

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<Signup />);

    // Fill required fields so HTML5 validation allows form submission
    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'Test Student' },
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'student@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Phone'), {
      target: { value: '0771234567' },
    });

    // Intentionally use different passwords
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'one' },
    });

    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'two' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /create account/i,
      }),
    );

    expect(alertSpy).toHaveBeenCalledWith('Passwords do not match!');
    expect(fetchMock).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('sends the selected role to the backend and redirects to login', async () => {
    const alertSpy = vi
      .spyOn(window, 'alert')
      .mockImplementation(() => {});

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'User registered successfully!',
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<Signup />);

    fillForm();

    const landlordButtons = screen.getAllByRole('button', {
      name: /landlord/i,
    });

    fireEvent.click(landlordButtons[0]);

    fireEvent.click(
      screen.getByRole('button', {
        name: /create account/i,
      }),
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login');
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/signup'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Student',
          email: 'student@example.com',
          phone: '0771234567',
          password: 'secret123',
          role: 'landlord',
        }),
      }),
    );

    alertSpy.mockRestore();
  });
});

