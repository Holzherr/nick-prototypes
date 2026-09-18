import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AccountPanel } from './AccountPanel';

const panel = (props: Partial<Parameters<typeof AccountPanel>[0]> = {}) =>
  render(<AccountPanel email="parent@example.com" pending={0} onSwitchChild={vi.fn()} onSignOut={vi.fn()} {...props} />);

describe('deleting an account', () => {
  it('asks before deleting, and only deletes on the second press', async () => {
    const onDeleteAccount = vi.fn().mockResolvedValue(null);
    panel({ onDeleteAccount });
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    expect(onDeleteAccount).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('can’t be undone');
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete everything' }));
    await waitFor(() => expect(window.location.hash).toBe('#/home'));
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });

  it('backs out without deleting', () => {
    const onDeleteAccount = vi.fn();
    panel({ onDeleteAccount });
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep my account' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onDeleteAccount).not.toHaveBeenCalled();
  });

  it('says so when it fails', async () => {
    panel({ onDeleteAccount: vi.fn().mockResolvedValue('The account could not be deleted.') });
    fireEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes, delete everything' }));
    expect(await screen.findByText('The account could not be deleted.')).toBeInTheDocument();
  });

  it('offers nothing to delete to a guest', () => {
    panel({ email: undefined });
    expect(screen.queryByRole('button', { name: 'Delete account' })).toBeNull();
  });
});
