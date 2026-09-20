import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The insert is what is under test, so the client is a mock that records what it was asked to write and
 * answers with whatever each test scripts — including the refusal a database without migration 0007 gives.
 */
const insert = vi.fn();
vi.mock('@/shared/supabase/client', () => ({
  cloudConfigured: true,
  supabase: { from: (table: string) => ({ insert: (row: unknown) => insert(table, row) }) },
}));

const { sendFeedback } = await import('./send-feedback');

const accept = () => Promise.resolve({ error: null });
const refuse = () => Promise.resolve({ error: { message: "Could not find the 'kind' column" } });

describe('sendFeedback', () => {
  beforeEach(() => {
    insert.mockReset();
    window.location.hash = '#/app';
  });

  it('sends reporter and kind alongside the message', async () => {
    insert.mockImplementation(accept);
    const result = await sendFeedback({ message: '  the voice is too fast ', locale: 'en-GB', reporter: 'Priyanka', kind: 'bug' });
    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith('maths_feedback', {
      message: 'the voice is too fast',
      contact: null,
      path: '/app',
      locale: 'en',
      session: null,
      reporter: 'Priyanka',
      kind: 'bug',
    });
  });

  it('names neither column when neither was chosen', async () => {
    insert.mockImplementation(accept);
    await sendFeedback({ message: 'hello' });
    const row = insert.mock.calls[0][1] as Record<string, unknown>;
    expect('reporter' in row).toBe(false);
    expect('kind' in row).toBe(false);
  });

  it('drops a reporter or kind that is not one of the fixed choices', async () => {
    insert.mockImplementation(accept);
    await sendFeedback({ message: 'hello', reporter: 'Someone else' as never, kind: 'question' as never });
    const row = insert.mock.calls[0][1] as Record<string, unknown>;
    expect('reporter' in row).toBe(false);
    expect('kind' in row).toBe(false);
  });

  it('retries once without reporter and kind when the labelled insert is refused', async () => {
    insert.mockImplementationOnce(refuse).mockImplementationOnce(accept);
    const result = await sendFeedback({ message: 'hello', reporter: 'Nick', kind: 'idea' });
    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledTimes(2);
    const retried = insert.mock.calls[1][1] as Record<string, unknown>;
    expect(retried.message).toBe('hello');
    expect('reporter' in retried).toBe(false);
    expect('kind' in retried).toBe(false);
  });

  it('reports failure when the retry is refused too, and retries only once', async () => {
    insert.mockImplementation(refuse);
    expect(await sendFeedback({ message: 'hello', reporter: 'Tara', kind: 'tara-noticed' })).toEqual({ ok: false });
    expect(insert).toHaveBeenCalledTimes(2);
  });

  it('does not retry an unlabelled insert', async () => {
    insert.mockImplementation(refuse);
    expect(await sendFeedback({ message: 'hello' })).toEqual({ ok: false });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it('sends nothing for an empty message', async () => {
    expect(await sendFeedback({ message: '   ', reporter: 'Nick' })).toEqual({ ok: false });
    expect(insert).not.toHaveBeenCalled();
  });
});
