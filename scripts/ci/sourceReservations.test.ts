import { expect, it } from 'vitest';
import retired from '../../data/retired-puzzle-ids.json';

it('preserves the retired source ledger independently of deleted runtime packs', () => {
  expect(retired.sourceRevision).toBe('81e1f3324bb881cc1281317393e5b75f1755c84c');
  expect(retired.bountyIds).toHaveLength(288);
  expect(retired.lessonIds).toHaveLength(9);
  const ids = [...retired.bountyIds, ...retired.lessonIds];
  expect(new Set(ids).size).toBe(ids.length);
  for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9]{5}$/);
});
