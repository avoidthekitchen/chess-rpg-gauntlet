import { describe, expect, it } from 'vitest';
import { dependencies, relativeImports, slowChecksFor } from './plan.mjs';

/** A tiny fake repo: battles imports battle.ts, which imports material.ts; boss imports boss.ts. */
const FILES: Record<string, string> = {
  'scripts/verify/battles.verify.test.ts': "import { Battle } from '../../src/game/battle';\nimport { Chess } from 'chess.js';",
  'scripts/verify/boss.verify.test.ts': "import { bossFen } from '../../src/game/boss';",
  'src/game/battle.ts': "import { PIECE_VALUE } from './material';\nexport type { Status } from './status';",
  'src/game/status.ts': 'export type Status = string;',
  'src/game/material.ts': 'export const PIECE_VALUE = {};',
  'src/game/boss.ts': "import type { HireType } from './economy';",
  'src/game/economy.ts': '',
  'src/scenes/Town.ts': "import { PIECE_VALUE } from '../game/material';",
};
const read = (p: string) => FILES[p] ?? null;

describe('ci plan', () => {
  it('finds relative imports and re-exports, skipping packages', () => {
    expect(relativeImports(FILES['src/game/battle.ts'])).toEqual(['./material', './status']);
    expect(relativeImports(FILES['scripts/verify/battles.verify.test.ts'])).toEqual(['../../src/game/battle']);
  });

  it('follows imports transitively', () => {
    expect([...dependencies('scripts/verify/battles.verify.test.ts', read)].sort()).toEqual([
      'scripts/verify/battles.verify.test.ts',
      'src/game/battle.ts',
      'src/game/material.ts',
      'src/game/status.ts',
    ]);
  });

  it('runs only the checks a change can reach', () => {
    expect(slowChecksFor(['src/game/material.ts'], read)).toEqual({ battles: 'src/game/material.ts', boss: null });
    expect(slowChecksFor(['src/game/economy.ts'], read)).toEqual({ battles: null, boss: 'src/game/economy.ts' });
    expect(slowChecksFor(['src/scenes/Town.ts', 'docs/design.md'], read)).toEqual({ battles: null, boss: null });
  });

  it('runs everything for engine or library changes, or when forced', () => {
    expect(slowChecksFor(['package-lock.json'], read)).toEqual({ battles: 'package-lock.json', boss: 'package-lock.json' });
    expect(slowChecksFor([], read, true)).toEqual({ battles: '--full', boss: '--full' });
  });
});
