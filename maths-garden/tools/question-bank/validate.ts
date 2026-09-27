/**
 * Checks the question bank and prints counts per topic and level.
 *   node tools/question-bank/validate.ts
 * Exits 1 on any error. The same check runs in the test suite (bank.test.ts).
 */
import { readFileSync } from 'node:fs';
import type { BankItem } from '../../src/features/games/bank/types.ts';
import { validateBank } from '../../src/features/games/bank/validate.ts';

const bank = JSON.parse(readFileSync(new URL('../../src/features/games/bank/question-bank.json', import.meta.url), 'utf8')) as BankItem[];
const { errors, counts, total } = validateBank(bank);
for (const [topic, levels] of Object.entries(counts)) console.log(`${topic.padEnd(9)} ${[1, 2, 3, 4, 5, 6].map((l) => `L${l} ${String(levels[l] ?? 0).padStart(2)}`).join('  ')}  = ${Object.values(levels).reduce((s, n) => s + n, 0)}`);
console.log(`${total} items, ${errors.length} errors`);
for (const e of errors) console.log(`  ${e}`);
process.exit(errors.length ? 1 : 0);
