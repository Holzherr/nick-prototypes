import { describe, expect, it } from 'vitest';
import { cleanIngredients, cleanSteps } from './model';

describe('publish form cleanup', () => {
  it('drops rows with no name and trims the rest', () => {
    expect(
      cleanIngredients([
        { name: '  Plum tomatoes ', quantity: ' 400 g ' },
        { name: '   ', quantity: '2' },
        { name: 'Basil', quantity: '' },
      ]),
    ).toEqual([
      { name: 'Plum tomatoes', quantity: '400 g', category: 'Produce' },
      { name: 'Basil', quantity: '', category: 'Produce' },
    ]);
  });

  it('categorises each ingredient as it cleans it', () => {
    expect(cleanIngredients([{ name: 'cheddar', quantity: '60 g' }])[0].category).toBe('Dairy');
  });

  it('drops blank steps and keeps the order', () => {
    expect(cleanSteps([' Heat the oil ', '  ', 'Add the onion'])).toEqual([
      'Heat the oil',
      'Add the onion',
    ]);
  });
});
