import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EtapesCinematiqueSimulee } from '../../doubles/EtapesCinematiqueSimulee.ts';
import { LanceCinematique } from '../../../src/cinematique/application/lanceCinematique.ts';

const uneCible = { nom: 'cible', url: 'https://github.com/org/cible.git' };

describe('LanceCinematique', () => {
  it('enchaîne bootstrap, génère-env, génère-config, démarre-proxy puis scan (proxy local)', async () => {
    const etapes = new EtapesCinematiqueSimulee();

    const code = await new LanceCinematique({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cible: uneCible, proxyLocal: true });

    expect(etapes.journal).toEqual([
      'bootstrap',
      'genereEnv',
      'genereConfig',
      'demarreProxy',
      'scan',
    ]);
    expect(code).toBe(0);
  });

  it('renvoie le statut du scan', async () => {
    const etapes = new EtapesCinematiqueSimulee({ codeScan: 42 });

    const code = await new LanceCinematique({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({ cible: uneCible, proxyLocal: true });

    expect(code).toBe(42);
  });

  it('interrompt la cinématique dès qu’une étape échoue', async () => {
    const etapes = new EtapesCinematiqueSimulee({ echoue: 'genereConfig' });

    await expect(
      new LanceCinematique({
        etapes,
        console: new ConsoleEnMemoire(),
      }).execute({ cible: uneCible, proxyLocal: true })
    ).rejects.toThrow('échec simulé : genereConfig');

    expect(etapes.journal).toEqual(['bootstrap', 'genereEnv', 'genereConfig']);
  });

  it('avec un proxy distant, ne démarre pas le conteneur local et le signale', async () => {
    const etapes = new EtapesCinematiqueSimulee();
    const console = new ConsoleEnMemoire();

    const code = await new LanceCinematique({ etapes, console }).execute({
      cible: uneCible,
      proxyLocal: false,
    });

    expect(etapes.journal).toEqual([
      'bootstrap',
      'genereEnv',
      'genereConfig',
      'scan',
    ]);
    expect(code).toBe(0);
    expect(console.lignes.map((l) => l.message)).toContain(
      'Proxy distant configuré — démarrage du conteneur local ignoré.'
    );
  });

  it('transmet la cible au bootstrap, la fenêtre à la génération de config et le nom au scan', async () => {
    const etapes = new EtapesCinematiqueSimulee();

    await new LanceCinematique({
      etapes,
      console: new ConsoleEnMemoire(),
    }).execute({
      cible: {
        nom: 'cible',
        url: 'https://github.com/org/cible.git',
        branche: 'main',
      },
      jours: 7,
      proxyLocal: true,
    });

    expect(etapes.cibleBootstrap).toEqual({
      nom: 'cible',
      url: 'https://github.com/org/cible.git',
      branche: 'main',
    });
    expect(etapes.configDemandee).toEqual({ nomCible: 'cible', jours: 7 });
    expect(etapes.cibleScannee).toBe('cible');
  });
});
