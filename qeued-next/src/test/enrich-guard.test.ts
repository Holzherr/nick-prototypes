import { describe, expect, it } from 'vitest';
import { enrichmentUpdate, needsResearch } from '../../supabase/functions/_shared/enrich.ts';

describe('needsResearch', () => {
  it('never researches a catalogued title, whatever its enriched flag says', () => {
    // The catalogue pipeline does not set `enriched`, so every catalogued row reads false.
    expect(needsResearch({ enriched: false, catalogue_version: 3, synopsis: 'A heist.' })).toBe(false);
  });
  it('researches a stub we hold no record for, once', () => {
    expect(needsResearch({ enriched: false, catalogue_version: 0, synopsis: null })).toBe(true);
    expect(needsResearch({ enriched: true, catalogue_version: 0, synopsis: null })).toBe(false);
  });
});

describe('enrichmentUpdate', () => {
  const found = { imdb_url: 'https://imdb/x', rt_url: 'https://rt/x', director: 'Model Guess', cast_names: ['A', 'B'], runtime_minutes: 999 };

  it('fills empty fields and leaves written ones alone', () => {
    const update = enrichmentUpdate({ director: 'Kathryn Bigelow', runtime_minutes: 131, cast_members: [], imdb_url: null }, found);
    expect(update).toEqual({ enriched: true, imdb_url: 'https://imdb/x', rt_url: 'https://rt/x', cast_members: ['A', 'B'] });
  });

  it('does not blank a field the model left empty', () => {
    expect(enrichmentUpdate({}, { director: '', cast_names: [], runtime_minutes: 0 })).toEqual({ enriched: true });
  });
});
