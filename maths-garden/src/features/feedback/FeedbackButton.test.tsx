import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sendFeedback = vi.fn();
vi.mock('./send-feedback', async () => ({ ...(await vi.importActual<typeof import('./send-feedback')>('./send-feedback')), sendFeedback }));

const { FeedbackButton } = await import('./FeedbackButton');

const group = (name: string) => within(screen.getByRole('radiogroup', { name }));

describe('FeedbackButton', () => {
  beforeEach(() => {
    localStorage.clear();
    sendFeedback.mockReset().mockResolvedValue({ ok: true });
  });

  it('offers three reporters and three kinds, and no free-text input for either', () => {
    render(<FeedbackButton defaultOpen />);
    expect(group('Who is this from?').getAllByRole('radio').map((r) => r.textContent)).toEqual(['Nick', 'Priyanka', 'Tara']);
    expect(group('What sort of thing?').getAllByRole('radio').map((r) => r.textContent)).toEqual(['Bug', 'Idea', 'Tara noticed']);
    // The only typed fields are the message and the optional email.
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });

  it('remembers the reporter on the device and sends both labels', async () => {
    render(<FeedbackButton defaultOpen />);
    fireEvent.click(group('Who is this from?').getByRole('radio', { name: 'Priyanka' }));
    fireEvent.click(group('What sort of thing?').getByRole('radio', { name: 'Tara noticed' }));
    expect(localStorage.getItem('maths-garden:feedback-reporter')).toBe('"Priyanka"');

    fireEvent.change(screen.getByRole('textbox', { name: 'Your feedback' }), { target: { value: 'she counted the dots twice' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Send' }).closest('form')!);
    await screen.findByText(/Thank you/);
    expect(sendFeedback).toHaveBeenCalledWith(expect.objectContaining({ reporter: 'Priyanka', kind: 'tara-noticed' }));
  });

  it('starts with the remembered reporter lit', () => {
    localStorage.setItem('maths-garden:feedback-reporter', '"Nick"');
    render(<FeedbackButton defaultOpen />);
    expect(group('Who is this from?').getByRole('radio', { name: 'Nick' })).toHaveAttribute('aria-checked', 'true');
  });
});
