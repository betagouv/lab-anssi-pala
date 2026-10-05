import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { EnvironnementEnMemoire } from '../../doubles/EnvironnementEnMemoire.ts';
import { GenerateurDeJetonFige } from '../../doubles/GenerateurDeJetonFige.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereEnvironnementProxy,
} from '../../../src/codex-security/application/genereEnvironnementProxy.ts';

const ENV_PROXY = 'outils/codex-security/codex-security.env';
const ENV_RACINE =
  'ALBERT_API_KEY=cle-albert\nALBERT_BASE_URL=https://albert.example/v1\n';

const uneGenerationEnvironnementProxyCodex = (doubles: Partial<Dependances> = {}) =>
  new GenereEnvironnementProxy({
    systemeDeFichier: new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE }),
    generateurDeJeton: new GenerateurDeJetonFige('sk-local-neuf'),
    environnement: new EnvironnementEnMemoire(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Environnement Proxy Codex', () => {
  it("génère l'environnement du proxy depuis le .env racine, avec un jeton local neuf", async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toBe(
      'ALBERT_API_KEY=cle-albert\nALBERT_BASE_URL=https://albert.example/v1\nLITELLM_MASTER_KEY=sk-local-neuf\n'
    );
  });

  it('conserve le jeton local existant pour ne pas invalider un proxy en marche', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
      [ENV_PROXY]: 'ALBERT_API_KEY=ancienne\nLITELLM_MASTER_KEY=sk-local-existant\n',
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'LITELLM_MASTER_KEY=sk-local-existant\n'
    );
  });

  it("remplace un jeton existant qui n'a pas le format sk-…", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
      [ENV_PROXY]: 'LITELLM_MASTER_KEY=a-remplacer\n',
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'LITELLM_MASTER_KEY=sk-local-neuf\n'
    );
  });

  it('ajoute la clé Scaleway, facultative, quand elle est renseignée', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': `${ENV_RACINE}SCALEWAY_DEEPSEEK_API_KEY=cle-scaleway\n`,
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'SCALEWAY_DEEPSEEK_API_KEY=cle-scaleway\n'
    );
  });

  it('reprend les variables du shell que le .env racine ne définit pas', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
    const environnement = new EnvironnementEnMemoire({
      SCALEWAY_DEEPSEEK_API_KEY: 'cle-du-shell',
    });

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier, environnement }).execute();

    expect(systemeDeFichier.lit(ENV_PROXY)).toContain(
      'SCALEWAY_DEEPSEEK_API_KEY=cle-du-shell\n'
    );
  });

  it('refuse de générer sans .env racine', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

    expect(() => uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()).toThrow(
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
    );
  });

  it('refuse de générer sans clé Albert', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': 'ALBERT_API_KEY=\nALBERT_BASE_URL=https://albert.example/v1\n',
    });

    expect(() => uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()).toThrow(
      'Erreur: ALBERT_API_KEY manquant ou vide dans .env'
    );
    expect(systemeDeFichier.existe(ENV_PROXY)).toBe(false);
  });

  it('refuse de générer sans URL Albert', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': 'ALBERT_API_KEY=cle-albert\n',
    });

    expect(() => uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()).toThrow(
      'Erreur: ALBERT_BASE_URL manquant dans .env'
    );
  });

  it("annonce le fichier généré et signale l'absence de Scaleway, sans afficher de clé", () => {
    const console = new ConsoleEnMemoire();

    uneGenerationEnvironnementProxyCodex({ console }).execute();

    expect(console.lignes.map((l) => l.message)).toEqual([
      'Généré: outils/codex-security/codex-security.env',
      '  Fournisseurs configurés pour le proxy : Albert (https://albert.example/v1) ; Scaleway absent (SCALEWAY_DEEPSEEK_API_KEY non renseignée dans .env)',
    ]);
  });

  it('annonce Albert et Scaleway quand les deux sont configurés', () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      '.env': `${ENV_RACINE}SCALEWAY_DEEPSEEK_API_KEY=cle-scaleway\n`,
    });
    const console = new ConsoleEnMemoire();

    uneGenerationEnvironnementProxyCodex({ systemeDeFichier, console }).execute();

    expect(console.lignes.map((l) => l.message)[1]).toBe(
      '  Fournisseurs configurés pour le proxy : Albert (https://albert.example/v1) + Scaleway (DeepSeek)'
    );
  });
});
