import { describe, expect, it } from 'vitest';
import { AttenteInstantanee } from '../../doubles/AttenteInstantanee.ts';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { ConteneurProxySimule } from '../../doubles/ConteneurProxySimule.ts';
import { ReseauSimule } from '../../doubles/ReseauSimule.ts';
import {
  DemarreProxy,
  type Dependances,
} from '../../../src/codex-security/application/demarreProxy.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';

const unDemarrageDuProxyCodex = (doubles: Partial<Dependances> = {}) =>
  new DemarreProxy({
    conteneur: new ConteneurProxySimule(),
    reseau: new ReseauSimule(),
    attente: new AttenteInstantanee(),
    console: new ConsoleEnMemoire(),
    systemeDeFichier: new SystemeDeFichierEnMemoire(),
    ...doubles,
  });

describe('Démarre Proxy Codex', () => {
  it.skip('ne démarre pas le proxy si les variables ne sont pas positionnées', async () => {
    const journal: string[] = [];

    const demarrageProxy = unDemarrageDuProxyCodex({
      conteneur: new ConteneurProxySimule(journal),
    });

    await expect(() => demarrageProxy.execute()).rejects.toThrow(
      'Positionnez les variables nécessaires au démarrage du proxy'
    );
  });

  it('remplace le conteneur existant : supprimé, puis démarré', async () => {
    const journal: string[] = [];

    await unDemarrageDuProxyCodex({
      conteneur: new ConteneurProxySimule(journal),
    }).execute();

    expect(journal).toEqual(['conteneur supprimé', 'conteneur démarré']);
  });

  it("démarre par défaut sur le port 4000 avec l'image LiteLLM figée par digest", async () => {
    const conteneur = new ConteneurProxySimule();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        image:
          'ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02',
        portLiteLLM: 4000,
      }),
    });

    await unDemarrageDuProxyCodex({ conteneur }).execute();

    expect(conteneur.configuration).toEqual({
      port: 4000,
      image:
        'ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02',
    });
  });

  it("PORT_LITE_LLM et CODEX_LITE_LLM_IMAGE surchargent le port et l'image", async () => {
    const conteneur = new ConteneurProxySimule();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        image: 'litellm:essai',
        portLiteLLM: 4100,
      }),
    });

    await unDemarrageDuProxyCodex({ conteneur }).execute();

    expect(conteneur.configuration).toEqual({
      port: 4100,
      image: 'litellm:essai',
    });
  });

  it("sans base de données, annonce que le plafond de budget n'est pas bloquant", async () => {
    const console = new ConsoleEnMemoire();

    await unDemarrageDuProxyCodex({ console }).execute();

    expect(console.lignes.map((l) => l.message)).toContain(
      "Budget : suivi seul (pas de DATABASE_URL) — le plafond n'est pas bloquant. Voir le README."
    );
  });

  it('avec LITELLM_DATABASE_URL, transmet la base au proxy et annonce le plafond appliqué', async () => {
    const conteneur = new ConteneurProxySimule();
    const console = new ConsoleEnMemoire();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        urlBaseDeDonnees: 'postgresql://budget',
      }),
    });

    await unDemarrageDuProxyCodex({ conteneur, console }).execute();

    expect(conteneur.configuration?.baseDeDonnees).toBe('postgresql://budget');
    expect(console.lignes.map((l) => l.message)).toContain(
      'Budget : enforcement actif (DATABASE_URL fournie).'
    );
  });

  it("attend que le proxy réponde, toutes les 2 secondes, puis annonce qu'il est prêt", async () => {
    const reseau = new ReseauSimule([false, false, true]);
    const attente = new AttenteInstantanee();
    const console = new ConsoleEnMemoire();

    await unDemarrageDuProxyCodex({ reseau, attente, console }).execute();

    expect(reseau.urlsInterrogees).toEqual(
      Array(3).fill('http://127.0.0.1:4000/health/liveliness')
    );
    expect(attente.attentes).toEqual([2000, 2000]);
    expect(console.lignes.map((l) => l.message).at(-1)).toBe(
      'Attente du proxy LiteLLM.. : prêt sur http://127.0.0.1:4000/v1'
    );
  });

  it('abandonne après 60 tentatives sans réponse du proxy', async () => {
    const reseau = new ReseauSimule([false]);

    await expect(unDemarrageDuProxyCodex({ reseau }).execute()).rejects.toThrow(
      'Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm'
    );
    expect(reseau.urlsInterrogees).toHaveLength(60);
  });
});
