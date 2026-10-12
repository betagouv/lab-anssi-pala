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

  it("construit la CLI Shannon quand elle n'est pas encore construite et l'annonce", async () => {
    const depot = new DepotShannonSimule({ cliConstruite: false });
    const console = new ConsoleEnMemoire();

    await new PrepareShannon({ depot, console }).prepare();

    expect(depot.construiteAppelee).toBe(true);
    expect(console.lignes.map((l) => l.message)).toContain(
      '    construit : CLI Shannon'
    );
  });

  it('ne reconstruit pas la CLI Shannon quand elle est déjà construite', async () => {
    const depot = new DepotShannonSimule({ cliConstruite: true });
    const console = new ConsoleEnMemoire();

    await new PrepareShannon({ depot, console }).prepare();

    expect(depot.construiteAppelee).toBe(false);
    expect(console.lignes.map((l) => l.message)).not.toContain(
      '    construit : CLI Shannon'
    );
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
