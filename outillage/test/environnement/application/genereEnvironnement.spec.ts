import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../../doubles/ConsoleEnMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../../doubles/SystemeDeFichierEnMemoire.ts';
import {
  type Dependances,
  GenereEnvironnement,
} from '../../../src/environnement/application/genereEnvironnement.ts';
import { environnement } from '../../../src/noyau/environnement.ts';

const ENV_SHANNON = 'outils/shannon/shannon.env';
const ENV_RACINE =
  'FOURNISSEUR_NOM=albert\nFOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\nFOURNISSEUR_MODELE=modele-fournisseur\nLITELLM_BASE_URL=http://127.0.0.1:4000\nLITELLM_API_KEY=sk-local\n';

const uneGenerationEnvironnement = (doubles: Partial<Dependances> = {}) =>
  new GenereEnvironnement({
    systemeDeFichier: new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE }),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });

describe('Génère Environnement', () => {
  describe('validation du .env racine', () => {
    it('refuse de générer sans .env racine', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire();

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
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
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_API_KEY manquant ou vide dans .env');
      expect(systemeDeFichier.existe(ENV_SHANNON)).toBe(false);
    });

    it('refuse de générer sans URL du fournisseur', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env': 'FOURNISSEUR_API_KEY=cle-fournisseur\n',
      });

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_BASE_URL manquant ou vide dans .env');
    });

    it('refuse de générer sans le modèle du fournisseur', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env':
          'FOURNISSEUR_API_KEY=cle-fournisseur\nFOURNISSEUR_BASE_URL=https://fournisseur.example/v1\n',
      });

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow('Erreur: FOURNISSEUR_MODELE manquant ou vide dans .env');
      expect(systemeDeFichier.existe(ENV_SHANNON)).toBe(false);
    });

    it('refuse de générer sans LITELLM_BASE_URL (URL du proxy)', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env':
          'FOURNISSEUR_API_KEY=cle\nFOURNISSEUR_BASE_URL=https://f.example/v1\nFOURNISSEUR_MODELE=m\nLITELLM_API_KEY=sk-x\n',
      });

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow('Erreur: LITELLM_BASE_URL manquant ou vide dans .env');
    });

    it('refuse de générer sans LITELLM_API_KEY (clé du proxy)', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({
        '.env':
          'FOURNISSEUR_API_KEY=cle\nFOURNISSEUR_BASE_URL=https://f.example/v1\nFOURNISSEUR_MODELE=m\nLITELLM_BASE_URL=https://p.example\n',
      });

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow('Erreur: LITELLM_API_KEY manquant ou vide dans .env');
    });
  });

  describe('en production (variables via process.env, pas de .env racine)', () => {
    const VARIABLES_PROD = {
      NODE_ENV: 'production',
      FOURNISSEUR_API_KEY: 'cle-fournisseur',
      FOURNISSEUR_BASE_URL: 'https://fournisseur.example/v1',
      FOURNISSEUR_MODELE: 'modele-fournisseur',
      LITELLM_BASE_URL: 'https://proxy.example',
      LITELLM_API_KEY: 'sk-prod',
    };
    const etatInitial = new Map<string, string | undefined>();

    beforeEach(() => {
      for (const [nom, valeur] of Object.entries(VARIABLES_PROD)) {
        etatInitial.set(nom, process.env[nom]);
        process.env[nom] = valeur;
      }
    });

    afterEach(() => {
      for (const [nom, valeur] of etatInitial) {
        if (valeur === undefined) delete process.env[nom];
        else process.env[nom] = valeur;
      }
      etatInitial.clear();
    });

    it('génère l’environnement sans .env racine quand les variables requises sont présentes', () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire();

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).not.toThrow();
      expect(systemeDeFichier.existe(ENV_SHANNON)).toBe(true);
    });

    it('refuse de générer si une variable requise manque dans l’environnement', () => {
      delete process.env.LITELLM_API_KEY;
      const systemeDeFichier = new SystemeDeFichierEnMemoire();

      expect(() =>
        uneGenerationEnvironnement({ systemeDeFichier }).execute()
      ).toThrow("Erreur: LITELLM_API_KEY manquant ou vide dans l'environnement");
    });
  });

  describe('pour Shannon', () => {
    it("génère l'environnement depuis le .env racine avec le modèle et la clef d’API", () => {
      const systemeDeFichier = new SystemeDeFichierEnMemoire({ '.env': ENV_RACINE });
      environnement.fournisseur = () => ({
        nom: 'albert',
        apiKey: 'cle-fournisseur',
        url: 'https://fournisseur.example/v1',
        modele: 'deepseek-v4-flash-0731',
      });

      uneGenerationEnvironnement({ systemeDeFichier }).execute();

      expect(systemeDeFichier.lit(ENV_SHANNON)).toBe(
        'SHANNON_AI_MODEL=albert:deepseek-v4-flash-0731\nSHANNON_AI_API_KEY=cle-fournisseur\n'
      );
    });

    it('annonce le fichier généré et le fournisseur configuré, sans afficher de clé', () => {
      const console = new ConsoleEnMemoire();
      environnement.fournisseur = () => ({
        apiKey: 'cle-fournisseur',
        modele: 'modele-fournisseur',
        nom: 'scaleway',
        url: 'https://scaleway.example/v1',
      });

      uneGenerationEnvironnement({ console }).execute();

      expect(console.lignes.map((l) => l.message).splice(0, 2)).toEqual([
        'Généré: outils/shannon/shannon.env',
        '  Fournisseur configuré pour Shannon : scaleway (modele-fournisseur)',
      ]);
    });
  });
});
