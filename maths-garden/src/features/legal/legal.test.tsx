import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthForm } from '@/features/auth/AuthForm';
import { PRIVACY, TERMS } from './documents';

describe('the legal documents', () => {
  it('keeps every section of both documents', () => {
    expect(TERMS.sections.map((s) => s.heading)).toHaveLength(19);
    expect(TERMS.sections.at(-1)?.heading).toBe('19. Contact');
    expect(PRIVACY.sections.map((s) => s.heading)).toHaveLength(13);
    expect(PRIVACY.intro[0]).toMatch(/is the controller/);
    for (const doc of [TERMS, PRIVACY]) for (const s of doc.sections) expect(s.paragraphs.length).toBeGreaterThan(0);
  });
});

describe('creating an account', () => {
  const form = (onSubmit = vi.fn()) => {
    render(<AuthForm mode="sign-up" onModeChange={() => {}} onSubmit={onSubmit} onGuest={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'parent@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'longenough' } });
    return onSubmit;
  };

  it('does not submit until the parent agrees to the Terms', () => {
    const onSubmit = form();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: /agree to the Terms/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledWith('parent@example.com', 'longenough');
  });

  it('does not ask a returning parent to agree again', () => {
    render(<AuthForm mode="sign-in" onModeChange={() => {}} onSubmit={() => {}} onGuest={() => {}} />);
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
});

describe('a confirmation link that failed', () => {
  it('sends a fresh link to the typed address', () => {
    const onResend = vi.fn();
    render(<AuthForm mode="sign-in" onModeChange={() => {}} onSubmit={() => {}} onResend={onResend} onGuest={() => {}} />);
    const send = screen.getByRole('button', { name: /fresh confirmation link/ });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: ' parent@example.com ' } });
    fireEvent.click(send);
    expect(onResend).toHaveBeenCalledWith('parent@example.com');
  });
});

describe('Google sign-in inside an app’s browser', () => {
  it('offers the way out to Safari instead of a button Google will refuse', () => {
    render(<AuthForm mode="sign-in" onModeChange={() => {}} onSubmit={() => {}} onGoogle={() => {}} inApp="LinkedIn" onGuest={() => {}} />);
    expect(screen.queryByRole('button', { name: /Continue with Google/ })).toBeNull();
    expect(screen.getByText(/doesn’t work inside LinkedIn’s built-in browser/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });
});
