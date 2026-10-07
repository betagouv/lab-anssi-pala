import { beforeEach, describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { HorlogeFigee } from '../../doubles/HorlogeFigee.ts';
import { ServeurCibleFumeeSimule } from '../../doubles/ServeurCibleFumeeSimule.ts';
import { ShannonSimule } from '../../doubles/ShannonSimule.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  LancePassageDeFumee,
} from '../../../src/shannon/application/lancePassageDeFumee.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import { ENVIRONNEMENT_SHANNON } from '../../doubles/environnement.ts';
import type { EnvironnementShannonDeLancement } from '../../../src/shannon/ports/Shannon.ts';

const unDepotDeFichiersPret = () =>
  new SystemeDeFichierEnMemoire({
    'outils/shannon/shannon.env':
      'SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\nSHANNON_AI_API_KEY=cle\n',
    'outils/shannon/source/apps/cli/dist/index.mjs': '',
  });

const unPassage = (doubles: Partial<Dependances> = {}) =>
  new LancePassageDeFumee({
    racine: '/depot',
    shannon: new ShannonSimule(),
    serveur: new ServeurCibleFumeeSimule(),
    systemeDeFichier: unDepotDeFichiersPret(),
    horloge: new HorlogeFigee(new Date(1_790_000_000_000)),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Lance Passage de fumée', () => {
  beforeEach(() => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
    });
  });

  it('sert la cible triviale sur 127.0.0.1:8080 puis y lance Shannon, décrit selon le fournisseur du modèle', async () => {
    const journal: string[] = [];
    const serveur = new ServeurCibleFumeeSimule(journal);
    const shannon = new ShannonSimule({
      apresLeRun: () => journal.push('Shannon lancé'),
    });

    await unPassage({ serveur, shannon }).execute();

    expect(journal.slice(0, 2)).toEqual(['cible servie sur 8080', 'Shannon lancé']);
    expect(shannon.lancements[0]).toMatchObject({
      url: 'http://host.docker.internal:8080',
      depot: '/depot/outils/shannon/smoke-target',
      modelsConfig: '/depot/outils/shannon/configs/models.albert.json',
    });
  });

  it('sert et vise le port demandé par SMOKE_PORT', async () => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      portTestDeFumee: 9090,
    });
    const journal: string[] = [];
    const shannon = new ShannonSimule();

    await unPassage({
      serveur: new ServeurCibleFumeeSimule(journal),
      shannon,
    }).execute();

    expect(journal[0]).toBe('cible servie sur 9090');
    expect(shannon.lancements[0].url).toBe('http://host.docker.internal:9090');
  });

  it('se contente par défaut des prompts minimaux de Shannon (pipeline de test)', async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon }).execute();

    expect(shannon.lancements[0].pipelineTesting).toBe(true);
  });

  it('lance les vrais prompts, avec le vrai agent de rapport, quand le test de pipeline est activé', async () => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      testPipelineActive: true,
    });

    const shannon = new ShannonSimule();

    await unPassage({
      shannon,
    }).execute();
    expect(shannon.lancements[0].pipelineTesting).toBe(false);
  });

  // TODO: l’espace de travail n’est pas une variable elle doit être calculée
  it.skip("ouvre un workspace neuf, nommé d'après le fournisseur et horodaté", async () => {
    const shannon = new ShannonSimule();
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      // espaceDeTravail: undefined,
    });

    await unPassage({ shannon }).execute();

    expect(shannon.lancements[0].workspace).toBe('albert-smoke-1790000000');
  });

  it('reprend le workspace désigné par l’environnement espaceDeTravail', async () => {
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      espaceDeTravail: 'albert-smoke-1',
    });
    const shannon = new ShannonSimule();

    await unPassage({
      shannon,
    }).execute();

    expect(shannon.lancements[0].workspace).toBe('albert-smoke-1');
  });

  it("transmet à Shannon l'environnement du shell complété par les variables shannon", async () => {
    environnement.path = '/usr/bin';
    const shannon = new ShannonSimule();

    await unPassage({
      shannon,
    }).execute();

    expect(
      shannon.lancements[0].environnement
    ).toMatchObject<EnvironnementShannonDeLancement>({
      PATH: '/usr/bin',
      SHANNON_AI_MODEL: 'albert:openai/gpt-oss-120b',
      SHANNON_AI_API_KEY: 'cle-shannon',
    });
  });

  // TODO: le modèle n’est pas une variable elle doit être calculée
  it.skip("exige un modèle désigné : aucun fournisseur n'est privilégié", async () => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.ecritFichier(
      'outils/shannon/shannon.env',
      'SHANNON_AI_API_KEY=cle\n'
    );
    environnement.pourShannon = () => ({
      ...ENVIRONNEMENT_SHANNON,
      // model: undefined,
    });

    await expect(
      unPassage({ serveur, shannon, systemeDeFichier }).execute()
    ).rejects.toThrow(
      'Erreur : SHANNON_AI_MODEL non renseigné (outils/shannon/shannon.env), ex. albert:openai/gpt-oss-120b'
    );
    expect(serveur.enService).toBe(false);
    expect(shannon.lancements).toEqual([]);
  });

  // TODO: On ne devrait pas lancer shannon si le modèle n’est pas fourni
  it.skip('lance sans description pi un modèle que Shannon connaît nativement', async () => {
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.ecritFichier(
      'outils/shannon/shannon.env',
      'SHANNON_AI_MODEL=anthropic:claude-sonnet-4-6\n'
    );

    await unPassage({ shannon, systemeDeFichier }).execute();

    expect(shannon.lancements[0].modelsConfig).toBeUndefined();
  });

  it('arrête toujours la cible servie, même quand Shannon échoue', async () => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule({ echec: new Error('Erreur Shannon') });

    await expect(unPassage({ serveur, shannon }).execute()).rejects.toThrow(
      'Erreur Shannon'
    );
    expect(serveur.enService).toBe(false);
  });

  it.each([
    [
      'outils/shannon/shannon.env',
      'Fichier manquant : outils/shannon/shannon.env (depuis shannon.env.template)',
    ],
    [
      'outils/shannon/source/apps/cli/dist/index.mjs',
      'CLI Shannon non construite (cd outils/shannon/source && pnpm build)',
    ],
  ])('ne sert ni ne lance rien sans %s', async (absent, message) => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotDeFichiersPret();
    systemeDeFichier.fichiers.delete(absent);

    await expect(
      unPassage({ serveur, shannon, systemeDeFichier }).execute()
    ).rejects.toThrow(message);
    expect(serveur.enService).toBe(false);
    expect(shannon.lancements).toEqual([]);
  });
});
