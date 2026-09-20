import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rankTonight, type TonightEntry } from './fastTonight';
import { CACHE_KEY } from './slateCache';
import TonightScreen, { type TonightResult } from './TonightScreen';

/** Fixture rows only: invented titles, no real list. */
const entry = (name: string, title: Partial<NonNullable<TonightEntry['title']>> = {}, over: Partial<TonightEntry> = {}): TonightEntry => ({
  status: 'want_to_watch', watched_rating: null, current_season: null, current_episode: null, ...over,
  title: {
    id: `id-${name}`, name, year: 2020, type: 'movie', genres: ['Drama'], tones: [], themes: [], imdb_rating: 7, runtime_minutes: 100, seasons: null,
    image_url: null, title_availability: [{ provider: 'Netflix', offer_type: 'subscription', url: null }], ...title,
  },
});
const series = (name: string, seasons: number, over: Partial<TonightEntry> = {}, rating = 7) =>
  entry(name, { type: 'series', genres: ['Drama', 'Crime'], seasons, runtime_minutes: 55, imdb_rating: rating }, over);

const queue = [
  entry('Harbour Lights', { genres: ['Thriller', 'Crime'], tones: ['tense'], runtime_minutes: 95 }),
  series('Long Winter', 6, {}, 9),
  entry('Small Hours', { genres: ['Comedy'], tones: ['warm'], runtime_minutes: 88, title_availability: [] }),
  series('The Ledger', 2),
  entry('Paper Town', { genres: ['Comedy', 'Romance'], runtime_minutes: 140 }, { status: 'watched', watched_rating: 5 }),
];

describe('rankTonight', () => {
  it('returns two distinct picks, the whole queue ranked by mood, and no model', () => {
    const { picks, ranked_queue, queue_size, scored } = rankTonight(queue, 'intense', 'long');
    expect(picks.map((p) => p.pick_type)).toEqual(['best', 'safe']);
    expect(picks[0].title).not.toBe(picks[1].title);
    expect([picks[0].title, queue_size, ranked_queue.length, scored]).toEqual(['Harbour Lights', 4, 4, false]);
    expect(rankTonight(queue, 'funny', 'long').picks[0].title).toBe('Small Hours');
    expect(rankTonight([queue[4]], 'easy', 'short')).toMatchObject({ picks: [], queue_size: 0, ranked_queue: [] });
  });

  it('ranks a series they are part-way through above an unstarted one of the same genres', () => {
    const rows = [series('Fresh', 2), series('Started', 2, { status: 'watching', current_season: 1, current_episode: 3 })];
    const { ranked_queue, picks } = rankTonight(rows, 'easy', 'long');
    expect(ranked_queue[0].title).toBe('Started');
    expect(picks[0].explanation).toBe("On Netflix · S1 E4 next · you're watching");
  });

  it('sorts a 95-minute film above a six-season series on a short night, and below it given time', () => {
    const rows = [
      entry('Quick Film', { genres: ['Comedy'], runtime_minutes: 95, imdb_rating: 6.5 }),
      series('Long Winter', 6, {}, 9),
      entry('Past Case', { genres: ['Drama', 'Crime'] }, { status: 'watched', watched_rating: 5 }),
    ];
    expect(rankTonight(rows, 'smart', 'long').ranked_queue.map((r) => r.title)).toEqual(['Long Winter', 'Quick Film']);
    const short = rankTonight(rows, 'smart', 'short');
    expect(short.ranked_queue.map((r) => r.title)).toEqual(['Quick Film', 'Long Winter']);
    expect(short.picks[0].title).toBe('Quick Film');
  });

  it('explains every title in one line from provider, runtime and list membership, never empty', () => {
    const lines = rankTonight(queue, 'easy', 'short').ranked_queue.map((r) => r.explanation);
    for (const line of lines) expect(line).toMatch(/^(On [^·]+ · )?(\d+ min · |\d+ seasons? · |S\d+ E\d+ next · )?(from your list|you're watching)$/);
    expect(lines).toEqual(expect.arrayContaining(['On Netflix · 95 min · from your list', '88 min · from your list']));
  });
});

const invoke = vi.fn();
const load = vi.fn();
vi.mock('@/shared/supabase/client', () => ({
  supabase: {
    from: () => ({ select: () => ({ eq: () => load() }) }),
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
  },
}));
vi.mock('@/features/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('@/features/household/ProfileContext', () => ({ useProfile: () => ({ active: { id: 'profile-1', name: 'Fixture' } }) }));

const scoredSlate: TonightResult = {
  picks: [{ title: 'The Ledger', type: 'series', year: 2020, genres: ['Drama'], imdb_rating: 7, explanation: 'Model says so.', pick_type: 'best', in_queue: true, providers: [] }],
  queue_size: 4, ranked_queue: [{ title: 'The Ledger', score: 91, explanation: 'Model says so.' }],
};
const best = () => screen.getAllByRole('heading', { level: 3 })[0].textContent;
const button = (name: RegExp | string) => screen.getByRole('button', { name });

describe('TonightScreen', () => {
  beforeEach(() => load.mockResolvedValue({ data: queue, error: null }));
  afterEach(() => {
    cleanup();
    localStorage.clear();
    invoke.mockReset();
    load.mockReset();
  });

  it('shows a retry, not the empty-list copy, when the list cannot be read, and paints after a retry', async () => {
    load.mockResolvedValueOnce({ data: null, error: { message: 'Failed to fetch' } });
    render(createElement(TonightScreen));
    await screen.findByText("Couldn't load your list");
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    expect(screen.queryByText(/Nothing on your list yet/)).not.toBeInTheDocument();
    expect(screen.queryByText('Put this on')).not.toBeInTheDocument();
    expect(button(/Sharpen these/)).toBeDisabled();
    fireEvent.click(button('Retry'));
    await screen.findByText('Put this on');
    expect(screen.queryByText("Couldn't load your list")).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(invoke).not.toHaveBeenCalled();
  });

  it('shows the empty-list copy only when the read returns no rows', async () => {
    load.mockResolvedValueOnce({ data: [], error: null });
    render(createElement(TonightScreen));
    await screen.findByText(/Nothing on your list yet/);
    expect(screen.queryByText("Couldn't load your list")).not.toBeInTheDocument();
  });

  it('paints two picks and the ranked queue without calling an edge function, and re-ranks on mood or length at once', async () => {
    render(createElement(TonightScreen));
    await screen.findByText('Put this on');
    expect(screen.getByText('Or this')).toBeInTheDocument();
    expect(screen.getByText(/The rest of your list, ranked for tonight \(4\)/)).toBeInTheDocument();
    expect(button(/Sharpen these/)).toBeInTheDocument();
    expect(best()).toContain('Harbour Lights');
    fireEvent.click(button('Funny'));
    expect(best()).toContain('Small Hours');
    fireEvent.click(button(/Got time/));
    expect(screen.getByText('Put this on')).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });

  it('holds the scored slate behind a button, then shows and caches it on press', async () => {
    invoke.mockResolvedValue({ data: scoredSlate, error: null });
    render(createElement(TonightScreen));
    await screen.findByText('Put this on');
    fireEvent.click(button(/Sharpen these/));
    const ready = await screen.findByRole('button', { name: /Sharper picks ready/ });
    expect(invoke).toHaveBeenCalledWith('watch-tonight', { body: { user_id: 'user-1', profile_id: 'profile-1', mood: 'intense', time: 'short' } });
    expect(screen.queryByText('Model says so.')).not.toBeInTheDocument();
    fireEvent.click(ready);
    expect(screen.getByText('Model says so.')).toBeInTheDocument();
    expect(button(/Try again/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CACHE_KEY)!)['profile-1|intense|short'].result.picks[0].title).toBe('The Ledger');
  });

  it('paints a saved scored slate for the key instead of the fast one, and the fast one for another key', async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ 'profile-1|intense|short': { result: { ...scoredSlate, scored: true }, timestamp: Date.now() } }));
    render(createElement(TonightScreen));
    await screen.findByText('Model says so.');
    expect(button(/Try again/)).toBeInTheDocument();
    fireEvent.click(button('Funny'));
    expect(screen.queryByText('Model says so.')).not.toBeInTheDocument();
    expect(button(/Sharpen these/)).toBeInTheDocument();
    expect(invoke).not.toHaveBeenCalled();
  });
});
