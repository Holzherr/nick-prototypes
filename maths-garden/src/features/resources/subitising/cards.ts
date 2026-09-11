import { ARRANGEMENTS, type Arrangement } from './patterns';

export type Stage = 1 | 2 | 3;

export const STAGES: Record<Stage, { from: number; to: number; label: string; goal: string }> = {
  1: { from: 1, to: 3, label: '1–3', goal: 'Say 1, 2 or 3 at a glance, without counting.' },
  2: { from: 1, to: 5, label: '1–5', goal: 'Up to 5 at a glance in any arrangement.' },
  3: { from: 6, to: 10, label: '6–10', goal: 'See 6–10 as two small groups or a ten frame (5 and 2 make 7).' },
};

export type CardFace = { kind: 'dots'; n: number; arrangement: Arrangement; seed: number } | { kind: 'numeral'; n: number };

export type CardSize = 'small' | 'large';
export const SIZES: Record<CardSize, { perPage: number; columns: number; rows: number; label: string }> = {
  small: { perPage: 8, columns: 2, rows: 4, label: 'Playing-card size (8 per page)' },
  large: { perPage: 2, columns: 1, rows: 2, label: 'Big flash cards (2 per page)' },
};

export interface CardOptions {
  /** Printed small on every card and on the guide; blank for none. */
  name: string;
  /** "dot" or an emoji. */
  icon: string;
  stage: Stage;
  arrangements: Arrangement[];
  answers: 'back' | 'corner' | 'none';
  numeralCards: boolean;
  size: CardSize;
  guide: boolean;
}

export const ICONS = ['dot', '🦄', '⭐', '💖', '🌸', '🦋', '🎤', '❄️'] as const;

export const DEFAULT_OPTIONS: CardOptions = {
  name: '',
  icon: 'dot',
  stage: 1,
  arrangements: ARRANGEMENTS.map((a) => a.id),
  answers: 'back',
  numeralCards: false,
  size: 'small',
  guide: true,
};

/** Every front for the options: each number in the stage × each chosen arrangement that suits it, then numeral cards. */
export function buildCards(o: CardOptions): CardFace[] {
  const { from, to } = STAGES[o.stage];
  const cards: CardFace[] = [];
  for (let n = from; n <= to; n++) {
    for (const a of ARRANGEMENTS) {
      if (o.arrangements.includes(a.id) && n >= a.min && n <= a.max) cards.push({ kind: 'dots', n, arrangement: a.id, seed: n * 7 + o.stage });
    }
  }
  if (o.numeralCards) for (let n = from; n <= to; n++) cards.push({ kind: 'numeral', n });
  return cards;
}

/** The answer side: a dot card's back is its numeral; a numeral card's back shows the dots. */
export const backOf = (face: CardFace): CardFace =>
  face.kind === 'dots' ? { kind: 'numeral', n: face.n } : { kind: 'dots', n: face.n, arrangement: face.n <= 6 ? 'dice' : 'frame', seed: 1 };

export interface Sheet {
  side: 'front' | 'back';
  columns: number;
  rows: number;
  cells: (CardFace | null)[];
}

/**
 * A4 sheets. With answers on the back, each front sheet is followed by its back sheet with the columns
 * mirrored, so a double-sided print flipped on the long edge lines every answer up behind its card.
 */
export function paginate(cards: readonly CardFace[], size: CardSize, withBacks: boolean): Sheet[] {
  const { perPage, columns, rows } = SIZES[size];
  const sheets: Sheet[] = [];
  for (let i = 0; i < cards.length; i += perPage) {
    const cells = Array.from({ length: perPage }, (_, k) => cards[i + k] ?? null);
    sheets.push({ side: 'front', columns, rows, cells });
    if (withBacks) {
      const backs = cells.map((_, k) => {
        const row = Math.floor(k / columns);
        const col = k % columns;
        const source = cells[row * columns + (columns - 1 - col)];
        return source ? backOf(source) : null;
      });
      sheets.push({ side: 'back', columns, rows, cells: backs });
    }
  }
  return sheets;
}

/** Presets from a link such as #/resources/subitising-cards?stage=2&name=Tara&icon=🦄 */
export function optionsFromParams(params: URLSearchParams, base: CardOptions = DEFAULT_OPTIONS): CardOptions {
  const stage = Number(params.get('stage'));
  return {
    ...base,
    name: params.get('name') ?? base.name,
    icon: params.get('icon') ?? base.icon,
    stage: stage === 1 || stage === 2 || stage === 3 ? stage : base.stage,
  };
}

export const cardsLink = (stage: Stage, name?: string, icon?: string) => {
  const params = new URLSearchParams({ stage: String(stage) });
  if (name) params.set('name', name);
  if (icon) params.set('icon', icon);
  return `#/resources/subitising-cards?${params}`;
};
