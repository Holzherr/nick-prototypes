import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthForm } from './AuthForm';
import { NewPasswordScreen } from './NewPasswordScreen';
import { captureRecovery, finishRecovery, isRecovering } from './recovery';

afterEach(() => finishRecovery());

describe('a password-reset link', () => {
  it('is recognised from the hash Supabase sends back', () => {
    captureRecovery('#access_token=a&expires_in=3600&refresh_token=b&token_type=bearer&type=recovery');
    expect(isRecovering()).toBe(true);
  });

  it('is not confused with a sign-up confirmation', () => {
    captureRecovery('#access_token=a&refresh_token=b&type=signup');
    expect(isRecovering()).toBe(false);
  });
});

describe('forgot password', () => {
  const form = (onForgot = vi.fn()) => {
    render(<AuthForm mode="sign-in" onModeChange={() => {}} onSubmit={() => {}} onForgot={onForgot} onGuest={() => {}} />);
    return onForgot;
  };

  it('asks for the email first', () => {
    const onForgot = form();
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(onForgot).not.toHaveBeenCalled();
    expect(screen.getByText(/Type your email above/)).toBeInTheDocument();
  });

  it('sends the reset to the typed address', () => {
    const onForgot = form();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: ' parent@example.com ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(onForgot).toHaveBeenCalledWith('parent@example.com');
  });
});

describe('choosing the new password', () => {
  it('saves it and then lets the parent carry on', async () => {
    const onSave = vi.fn().mockResolvedValue(null);
    const onDone = vi.fn();
    render(<NewPasswordScreen email="parent@example.com" onSave={onSave} onDone={onDone} />);
    fireEvent.change(screen.getByPlaceholderText(/New password/), { target: { value: 'a-better-one' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    fireEvent.click(await screen.findByRole('button', { name: /Carry on/ }));
    expect(onSave).toHaveBeenCalledWith('a-better-one');
    expect(onDone).toHaveBeenCalled();
  });

  it('shows why it was refused', async () => {
    render(
      <NewPasswordScreen
        email="p@example.com"
        onSave={vi.fn().mockResolvedValue('New password should be different from the old password.')}
        onDone={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/New password/), { target: { value: 'the-same-one' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByText(/should be different/)).toBeInTheDocument();
  });
});
