import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { DepotShannonSimule } from '../../doubles/DepotShannonSimule.ts';
import { PrepareShannon } from '../../../src/shannon/application/prepareShannon.ts';

describe('Prépare Shannon', () => {
  it("applique les patchs locaux sur les sources de Shannon et l'annonce", async () => {
    const depot = new DepotShannonSimule({
      patchs: ['patches/bash-timeout-30s.patch'],
    });
    const console = new ConsoleEnMemoire();

    await new PrepareShannon({ depot, console }).prepare();

    expect(depot.patchsAppliques).toEqual(['patches/bash-timeout-30s.patch']);
    expect(console.lignes.map((l) => l.message)).toEqual([
      '    patch appliqué : patches/bash-timeout-30s.patch',
    ]);
  });

  it("laisse un patch déjà appliqué (ou non applicable en l'état) et le signale", async () => {
    const depot = new DepotShannonSimule({
      patchs: ['patches/bash-timeout-30s.patch'],
      dejaAppliques: ['patches/bash-timeout-30s.patch'],
    });
    const console = new ConsoleEnMemoire();

    await new PrepareShannon({ depot, console }).prepare();

    expect(depot.patchsAppliques).toEqual([]);
    expect(console.lignes.map((l) => l.message)).toEqual([
      "    patch déjà appliqué (ou non applicable en l'état) : patches/bash-timeout-30s.patch",
    ]);
  });
});
