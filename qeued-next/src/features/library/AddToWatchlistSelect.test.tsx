import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';
import RecommendationCard from '@/features/recommend/RecommendationCard';
import { PickCard } from '@/features/tonight/TonightScreen';

// Every write to watch_entries lands here; `replies` answers the inserts in order.
const calls: { op: string; payload: Record<string, unknown> }[] = [];
let replies: ({ code: string; message: string } | null)[] = [];
vi.mock('@/shared/supabase/client', () => ({
  supabase: {
    from: () => ({
      // The titles lookup for a pick that came without a title_id.
      select: () => {
        const chain = { ilike: () => chain, limit: () => chain, maybeSingle: () => Promise.resolve({ data: { id: 'title-3' } }) };
        return chain;
      },
      insert: (payload: Record<string, unknown>) => {
        calls.push({ op: 'insert', payload });
        return Promise.resolve({ error: replies.shift() ?? null });
      },
      update: (payload: Record<string, unknown>) => {
        calls.push({ op: 'update', payload });
        const chain = { eq: () => chain, then: (done: (r: unknown) => void) => done({ error: null }) };
        return chain;
      },
    }),
  },
}));
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('@/features/household/ProfileContext', () => ({ useProfile: () => ({ active: { id: 'profile-1' } }) }));
// Radix Select does not open in jsdom; a native select drives the same onValueChange.
vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ onValueChange, children }: { onValueChange: (v: string) => void; children: ReactNode }) => (
    <select aria-label="Add to" onChange={(e) => onValueChange(e.target.value)}><option value="" />{children}</select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>,
}));

const rec = { title_id: 'title-1', title: 'Harbour Lights', genres: [], imdb_rating: 7, match_score: 80, explanation: 'x', type: 'movie', year: 2021 };
const pick = { title: 'Long Winter', title_id: 'title-2', type: 'series' as const, year: 2020, genres: [], imdb_rating: 8, explanation: 'x', pick_type: 'wildcard' as const, in_queue: false, providers: [] };
const add = (status = 'want_to_watch') => fireEvent.change(screen.getByLabelText('Add to'), { target: { value: status } });

beforeEach(() => {
  calls.length = 0;
  replies = [];
});

it('a recommendation is added with source recommendation', async () => {
  render(<MemoryRouter><RecommendationCard rec={rec} userId="user-1" onRemoved={() => {}} onNeedMore={() => {}} /></MemoryRouter>);
  add();
  await waitFor(() => expect(calls).toHaveLength(1));
  expect(calls[0]).toEqual({ op: 'insert', payload: { user_id: 'user-1', profile_id: 'profile-1', title_id: 'title-1', status: 'want_to_watch', source: 'recommendation' } });
});

it("one of Tonight's picks is added with source tonight, and an existing entry is updated without a source", async () => {
  replies = [{ code: '23505', message: 'duplicate key value' }];
  render(<MemoryRouter><PickCard pick={pick} /></MemoryRouter>);
  add('watching');
  await waitFor(() => expect(calls).toHaveLength(2));
  expect(calls[0]).toMatchObject({ op: 'insert', payload: { title_id: 'title-2', source: 'tonight' } });
  expect(calls[1]).toEqual({ op: 'update', payload: { user_id: 'user-1', status: 'watching' } });
  expect(calls[1].payload).not.toHaveProperty('source');
});

it('an insert rejected with PGRST204 is retried once without source and the entry is added', async () => {
  replies = [{ code: 'PGRST204', message: "Could not find the 'source' column" }];
  render(<MemoryRouter><PickCard pick={pick} /></MemoryRouter>);
  add();
  await waitFor(() => expect(calls).toHaveLength(2));
  expect(calls.map((c) => c.op)).toEqual(['insert', 'insert']);
  expect(calls[1].payload).not.toHaveProperty('source');
  expect(calls[1].payload).toMatchObject({ title_id: 'title-2', status: 'want_to_watch' });
});

it("Tonight's wildcard, which comes without a title_id, is looked up by name and added with source tonight", async () => {
  render(<MemoryRouter><PickCard pick={{ ...pick, title_id: undefined }} /></MemoryRouter>);
  add();
  await waitFor(() => expect(calls).toHaveLength(1));
  expect(calls[0]).toMatchObject({ op: 'insert', payload: { title_id: 'title-3', source: 'tonight' } });
});
