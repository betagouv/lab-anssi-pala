import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereEnvironnement,
} from '../../../src/environnement/application/genereEnvironnement.ts';
import { environnement } from '../../../src/noyau/environnement.ts';
import {
  ENVIRONNEMENT_CODEX_SECURITY,
  ENVIRONNEMENT_PROXY,
} from '../../doubles/environnement.ts';

const ENV_CODEX_SECURITY = 'outils/codex-security/codex-security.env';
const ENV_SHANNON = 'outils/shannon/shannon.env';
const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=modele-fournisseur\n';

const uneGenerationEnvironnementProxyCodex = (doubles: Partial<Dependances> = {}) =>
  new GenereEnvironnement({
    systemeDeFichier: new SystemeDeFichierEnMemoire({
      '.env': ENV_RACINE,
      ENV_PROXY: '',
    }),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Environnement', () => {
  describe('pour Codex Security', () => {
    it('recopie la clé LITELLM_API_KEY du .env racine sans en générer', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
      environnement.fournisseur = () => ({
        apiKey: 'cle-fournisseur',
        modele: 'modele-fournisseur',
        nom: 'albert',
        url: 'https://fournisseur.example/v1',
      });
      environnement.urlLiteLLMConfiguree = () => '';
      environnement.pourCodexSecurity = () => ({
        ...ENVIRONNEMENT_CODEX_SECURITY,
        proxy: () => ({
          ...ENVIRONNEMENT_PROXY,
          jeton: 'cle-fournie-dans-le-env-racine',
        }),
      });

      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

      expect(systemeDeFichier.lit(ENV_CODEX_SECURITY)).toBe(
        'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nLITELLM_API_KEY=cle-fournie-dans-le-env-racine\nCODEX_API_KEY=cle-fournie-dans-le-env-racine\n'
      );
    });

    it('persiste LITELLM_BASE_URL quand un proxy distant est configuré', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
      environnement.fournisseur = () => ({
        apiKey: 'cle-fournisseur',
        modele: 'modele-fournisseur',
        nom: 'albert',
        url: 'https://fournisseur.example/v1',
      });
      environnement.urlLiteLLMConfiguree = () =>
        'https://litellm.local';

      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

      expect(systemeDeFichier.lit(ENV_CODEX_SECURITY)).toContain(
        'LITELLM_BASE_URL=https://litellm.local\n'
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

    it('refuse de générer sans clé du fournisseur', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env':
          'FOURNISSEUR_API_KEY=\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\n',
      });

      expect(() =>
        uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_API_KEY manquant ou vide dans .env');
      expect(systemeDeFichier.existe(ENV_CODEX_SECURITY)).toBe(false);
      expect(systemeDeFichier.existe(ENV_SHANNON)).toBe(false);
    });

    it('refuse de générer sans URL du fournisseur', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env': 'FOURNISSEUR_API_KEY=cle-fournisseur\n',
      });

      expect(() =>
        uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_BASE_URL manquant ou vide dans .env');
    });

    it('annonce le fichier généré et le fournisseur configuré, sans afficher de clé', () => {
      const console = new ConsoleEnMemoire();
      environnement.fournisseur = () => ({
        apiKey: 'cle-fournisseur',
        modele: 'modele-fournisseur',
        nom: 'scaleway',
        url: 'https://scaleway.example/v1',
      });

      uneGenerationEnvironnementProxyCodex({ console }).execute();

      expect(console.lignes.map((l) => l.message).splice(0, 2)).toEqual([
        'Généré: outils/codex-security/codex-security.env',
        '  Fournisseur configuré pour le proxy : scaleway (https://scaleway.example/v1)',
      ]);
    });
  });

  describe('pour Shannon', () => {
    it("génère l'environnement depuis le .env racine avec le modèle et la clef d’API", async () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
      environnement.fournisseur = () => ({
        nom: 'albert',
        apiKey: 'cle-fournisseur',
        url: 'https://fournisseur.example/v1',
        modele: 'deepseek-v4-flash-0731',
      });

      uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute();

      expect(systemeDeFichier.lit(ENV_SHANNON)).toBe(
        'SHANNON_AI_MODEL=albert:deepseek-v4-flash-0731\nSHANNON_AI_API_KEY=cle-fournisseur\n'
      );
    });

    it('refuse de générer sans le modèle', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env':
          'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\n',
      });

      expect(() =>
        uneGenerationEnvironnementProxyCodex({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_MODELE manquant ou vide dans .env');
      expect(systemeDeFichier.existe(ENV_SHANNON)).toBe(false);
      expect(systemeDeFichier.existe(ENV_CODEX_SECURITY)).toBe(false);
    });

    it('annonce le fichier généré et le fournisseur configuré, sans afficher de clé', () => {
      const console = new ConsoleEnMemoire();
      environnement.fournisseur = () => ({
        apiKey: 'cle-fournisseur',
        modele: 'modele-fournisseur',
        nom: 'scaleway',
        url: 'https://scaleway.example/v1',
      });

      uneGenerationEnvironnementProxyCodex({ console }).execute();

      expect(console.lignes.map((l) => l.message).splice(2, 2)).toEqual([
        'Généré: outils/shannon/shannon.env',
        '  Fournisseur configuré pour Shannon : scaleway (modele-fournisseur)',
      ]);
    });
  });
});
