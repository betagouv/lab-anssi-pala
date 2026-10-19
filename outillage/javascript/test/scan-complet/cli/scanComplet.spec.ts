import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EtapesScanCompletSimulee } from '../../doubles/EtapesScanCompletSimulee.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  scanComplet,
  type DependancesCli,
} from '../../../src/scan-complet/cli/scanComplet.ts';

const lesDependances = (doubles: Partial<DependancesCli> = {}): DependancesCli => ({
  etapes: new EtapesScanCompletSimulee(),
  console: new ConsoleEnMemoire(),
  systemeDeFichier: new SystemeDeFichierEnMemoire(),
  proxyLocal: true,
  ...doubles,
});

describe('scan-complet (ligne de commande)', () => {
  it("exige au moins une cible (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await scanComplet([], lesDependances({ console }));

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      'Erreur : fournir au moins une --cible <url>, ou --cibles <fichier.json>.'
    );
  });

  it('enchaîne le scan pour les cibles fournies en ligne, nom dérivé de l’URL', async () => {
    const etapes = new EtapesScanCompletSimulee();

    const code = await scanComplet(
      [
        '--cible',
        'https://github.com/org/a.git',
        '--cible',
        'https://github.com/org/b.git',
        '--branch',
        'main',
        '--jours',
        '7',
      ],
      lesDependances({ etapes })
    );

    expect(code).toBe(0);
    expect(etapes.ciblesBootstrapees).toEqual([
      { nom: 'a', url: 'https://github.com/org/a.git', branche: 'main' },
      { nom: 'b', url: 'https://github.com/org/b.git', branche: 'main' },
    ]);
    expect(etapes.configsDemandees).toEqual([
      { nomCible: 'a', jours: 7 },
      { nomCible: 'b', jours: 7 },
    ]);
  });

  it('lit les cibles depuis un fichier JSON', async () => {
    const etapes = new EtapesScanCompletSimulee();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '/cibles.json':
        '["https://github.com/org/a.git", "https://github.com/org/b.git"]',
    });

    const code = await scanComplet(
      ['--cibles', '/cibles.json'],
      lesDependances({ etapes, systemeDeFichier })
    );

    expect(code).toBe(0);
    expect(etapes.ciblesScannees).toEqual(['a', 'b']);
  });

  it('signale un fichier de cibles invalide en erreur d’usage (code 2)', async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '/cibles.json': '{pas du json',
    });

    const code = await scanComplet(
      ['--cibles', '/cibles.json'],
      lesDependances({ console, systemeDeFichier })
    );

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      'Fichier de cibles illisible : JSON invalide.'
    );
  });

  it('transmet la localité du proxy au cas d’usage (proxy distant : pas de conteneur local)', async () => {
    const etapes = new EtapesScanCompletSimulee();

    await scanComplet(
      ['--cible', 'https://github.com/org/a.git'],
      lesDependances({ etapes, proxyLocal: false })
    );

    expect(etapes.journal).not.toContain('demarreProxy');
  });
});
