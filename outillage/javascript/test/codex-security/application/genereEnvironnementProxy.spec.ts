import { beforeEach, describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { GenerateurDeJetonFige } from '../../doubles/GenerateurDeJetonFige.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereEnvironnementProxy,
} from '../../../src/codex-security/application/genereEnvironnementProxy.ts';
import {
  environnement,
  type EnvironnementProxy,
} from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';

const ENV_PROXY = 'outils/codex-security/codex-security.env';
const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\n';

const uneGenerationEnvironnementProxyCodex = (doubles: Partial<Dependances> = {}) =>
  new GenereEnvironnementProxy({
    systemeDeFichier: new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
      ENV_PROXY: '',
    }),
    generateurDeJeton: new GenerateurDeJetonFige('sk-local-neuf'),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Environnement Proxy Codex', () => {
  it("génère l'environnement du proxy depuis le .env racine, avec un jeton local neuf", async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({}) as EnvironnementProxy,
    });
    environnement.fournisseur = () => ({
      nom: 'albert',
      apiKey: 'cle-fournisseur',
      url: 'https://fournisseur.example/v1',
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toBe(
      'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nLITELLM_MASTER_KEY=sk-local-neuf\nCODEX_API_KEY=sk-local-neuf\n'
    );
  });

  it('conserve le jeton local existant pour ne pas invalider un proxy en marche', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
    });
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        LITELLM_MASTER_KEY: 'sk-local-existant',
      }),
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'LITELLM_MASTER_KEY=sk-local-existant\n'
    );
  });

  it("remplace un jeton existant qui n'a pas le format sk-…", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
    });
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
        LITELLM_MASTER_KEY: 'a-remplacer',
      }),
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'LITELLM_MASTER_KEY=sk-local-neuf\n'
    );
  });

  it('refuse de générer sans .env racine', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

    expect(() =>
      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
    ).toThrow(
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
    );
  });

  // TODO: Forcer à définir les variables d’env (vérifier que les variables obligatoirse sont déclarées)
  it.skip('refuse de générer sans clé du fournisseur', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env':
        'FOURNISSEUR_API_KEY=\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\n',
    });

    expect(() =>
      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
    ).toThrow('Erreur: FOURNISSEUR_API_KEY manquant ou vide dans .env');
    expect(systemeDeFichier.existe(ENV_PROXY)).toBe(false);
  });

  // TODO: Forcer à définir les variables d’env (vérifier que les variables obligatoirse sont déclarées)
  it.skip('refuse de générer sans URL du fournisseur', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': 'FOURNISSEUR_API_KEY=cle-fournisseur\n',
    });

    expect(() =>
      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
    ).toThrow('Erreur: FOURNISSEUR_BASE_URL manquant dans .env');
  });

  it('annonce le fichier généré et le fournisseur configuré, sans afficher de clé', () => {
    const console = new ConsoleEnMemoire();
    environnement.pourCodexSecurity = () => ({
      ...ENVIRONNEMENT_CODEX_SECURITY,
      proxy: () => ({
        ...ENVIRONNEMENT_PROXY,
      }),
    });
    environnement.fournisseur = () => ({
      nom: 'scaleway',
      apiKey: 'cle-fournisseur',
      url: 'https://scaleway.example/v1',
    });

    uneGenerationEnvironnementProxyCodex({ console }).execute();

    expect(console.lignes.map((l) => l.message)).toEqual([
      'Généré: outils/codex-security/codex-security.env',
      '  Fournisseur configuré pour le proxy : scaleway (https://scaleway.example/v1)',
    ]);
  });
});
