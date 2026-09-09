import type { Recommendation } from '@/features/recommend/RecommendationCard';

/** Invented but realistic data for stories and tests. */
export const recommendations: Recommendation[] = [
  {
    title: 'Slow Horses',
    type: 'series',
    year: 2022,
    genres: ['Spy', 'Drama', 'Dark comedy'],
    imdb_rating: 8.2,
    match_score: 94,
    explanation: 'You rated Severance and The Bear highly: same dry humour, same slow-burn ensemble.',
    image_url: undefined,
  },
  {
    title: 'Past Lives',
    type: 'movie',
    year: 2023,
    genres: ['Romance', 'Drama'],
    imdb_rating: 7.8,
    match_score: 88,
    explanation: 'Quiet, adult, under two hours. Matches the "easy" mood filter.',
    image_url: undefined,
  },
];

export const userId = '00000000-0000-4000-8000-000000000001';
