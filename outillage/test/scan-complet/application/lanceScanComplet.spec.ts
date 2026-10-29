import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EtapesScanCompletSimulee } from '../../doubles/EtapesScanCompletSimulee.ts';
import { LanceScanComplet } from '../../../src/scan-complet/application/lanceScanComplet.ts';

const uneCible = { nom: 'a', url: 'https://github.com/org/a.git' };
const autreCible = { nom: 'b', url: 'https://github.com/org/b.git' };

const MESSAGE_PROXY_DISTANT =
  'Proxy distant configuré — démarrage du conteneur local ignoré.';

describe('Lance le scan complet', () => {
  it('prépare l’environnement global une fois, puis enchaîne chaque cible (proxy local)', async () => {
    const etapes = new EtapesScanCompletSimulee();

    const code = await new LanceScanComplet({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cibles: [uneCible, autreCible], proxyLocal: true });

    expect(etapes.journal).toEqual([
      'genereEnv',
      'demarreProxy',
      'bootstrap',
      'genereConfig',
      'scan',
      'bootstrap',
      'genereConfig',
      'scan',
    ]);
    expect(etapes.ciblesScannees).toEqual(['a', 'b']);
    expect(code).toBe(0);
  });

  it('ne génère l’environnement et ne démarre le proxy qu’une seule fois', async () => {
    const etapes = new EtapesScanCompletSimulee();

    await new LanceScanComplet({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cibles: [uneCible, autreCible], proxyLocal: true });

    expect(etapes.journal.filter((e) => e === 'genereEnv')).toHaveLength(1);
    expect(etapes.journal.filter((e) => e === 'demarreProxy')).toHaveLength(1);
  });

  it('avec un proxy distant, ne démarre pas le conteneur local et le signale une fois', async () => {
    const etapes = new EtapesScanCompletSimulee();
    const console = new ConsoleEnMemoire();

    await new LanceScanComplet({ etapes, console }).execute({
      cibles: [uneCible, autreCible],
      proxyLocal: false,
    });

    expect(etapes.journal).not.toContain('demarreProxy');
    expect(
      console.lignes.map((l) => l.message).filter((m) => m === MESSAGE_PROXY_DISTANT)
    ).toHaveLength(1);
  });

  it('poursuit les cibles suivantes même si un scan échoue, et renvoie le nombre d’échecs', async () => {
    const etapes = new EtapesScanCompletSimulee({ codesScan: { b: 42 } });

    const code = await new LanceScanComplet({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({
      cibles: [
        uneCible,
        autreCible,
        { nom: 'c', url: 'https://github.com/org/c.git' },
      ],
      proxyLocal: true,
    });

    expect(etapes.ciblesScannees).toEqual(['a', 'b', 'c']);
    expect(code).toBe(1);
  });

  it('compte comme échec une cible dont une étape lève un erreur, sans interrompre les suivantes', async () => {
    const etapes = new EtapesScanCompletSimulee({
      leveSur: { etape: 'bootstrap', cible: 'a' },
    });

    const code = await new LanceScanComplet({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cibles: [uneCible, autreCible], proxyLocal: true });

    expect(etapes.ciblesScannees).toEqual(['b']);
    expect(code).toBe(1);
  });

  it('transmet la fenêtre de jours à la génération de config de chaque cible', async () => {
    const etapes = new EtapesScanCompletSimulee();

    await new LanceScanComplet({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cibles: [uneCible, autreCible], jours: 7, proxyLocal: true });

    expect(etapes.configsDemandees).toEqual([
      { nomCible: 'a', jours: 7 },
      { nomCible: 'b', jours: 7 },
    ]);
  });
});
