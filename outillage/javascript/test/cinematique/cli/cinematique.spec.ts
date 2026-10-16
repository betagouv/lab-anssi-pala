import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EtapesCinematiqueSimulee } from '../../doubles/EtapesCinematiqueSimulee.ts';
import {
  scanComplet,
  type DependancesCli,
} from '../../../src/cinematique/cli/scanComplet.ts';

const lesDependances = (doubles: Partial<DependancesCli> = {}): DependancesCli => ({
  etapes: new EtapesCinematiqueSimulee(),
  console: new ConsoleEnMemoire(),
  proxyLocal: true,
  ...doubles,
});

describe('cinématique (ligne de commande)', () => {
  it("exige --project (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await scanComplet(
      ['--url', 'https://github.com/org/cible.git'],
      lesDependances({ console })
    );

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      "error: required option '--project <nom>' not specified"
    );
  });

  it('enchaîne la cinématique pour la cible fournie et renvoie le code', async () => {
    const etapes = new EtapesCinematiqueSimulee();

    const code = await scanComplet(
      [
        '--project',
        'cible',
        '--url',
        'https://github.com/org/cible.git',
        '--branch',
        'main',
        '--jours',
        '7',
      ],
      lesDependances({ etapes })
    );

    expect(code).toBe(0);
    expect(etapes.cibleBootstrap).toEqual({
      nom: 'cible',
      url: 'https://github.com/org/cible.git',
      branche: 'main',
    });
    expect(etapes.configDemandee).toEqual({ nomCible: 'cible', jours: 7 });
  });

  it('transmet la localité du proxy au cas d’usage (proxy distant : pas de conteneur local)', async () => {
    const etapes = new EtapesCinematiqueSimulee();

    await scanComplet(
      ['--project', 'cible', '--url', 'https://github.com/org/cible.git'],
      lesDependances({ etapes, proxyLocal: false })
    );

    expect(etapes.journal).not.toContain('demarreProxy');
  });
});
