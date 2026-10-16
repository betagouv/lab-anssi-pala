import type { SystemeDeFichier } from './ports/SystemeDeFichier.ts';
import {
  CHEMIN_FICHIER_ENV_CODEX,
  CHEMIN_FICHIER_ENV_RACINE,
  CHEMIN_FICHIER_ENV_SHANNON,
} from '../codex-security/domaine/cheminEnvironnement.ts';
import { parseEnv } from 'node:util';
import * as process from 'node:process';

export type EnvironnementShannon = {
  apiKey: string;
  model: string;
  nombreEssais: number;
  portTestDeFumee: number;
  testPipelineActive: boolean;
  espaceDeTravail: string;
};

export type EnvironnementCodexSecurity = {
  proxy: (systemeDeFichier: SystemeDeFichier) => EnvironnementProxy;
};

export type EnvironnementProxy = {
  jeton: string;
  image: string;
  urlBaseDeDonnees?: string;
  portLiteLLM: number;
};

export type EnvironnementFournisseur = {
  apiKey: string;
  modele: string;
  nom: string;
  url: string;
};

type Environnement = {
  mattermost: () => { urlWebhook: string };
  path: string;
  pourShannon: (systemeDeFichier: SystemeDeFichier) => EnvironnementShannon;
  pourCodexSecurity: () => EnvironnementCodexSecurity;
  fournisseur: () => EnvironnementFournisseur;
  // URL du proxy LiteLLM souhaitée (depuis le .env racine), vide si laissée au proxy local par défaut.
  urlLiteLLMConfiguree: () => string;
  verifiePresenceFichierRacine(systemeDeFichier: SystemeDeFichier): void;
};

const IMAGE_LITE_LLM_PAR_DEFAUT =
  'ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02';

const variablesCodexSecurity: EnvironnementCodexSecurity = {
  proxy: (systemeDeFichier: SystemeDeFichier) => {
    let variablesProxy = '';
    if (systemeDeFichier.existe(CHEMIN_FICHIER_ENV_CODEX)) {
      variablesProxy = systemeDeFichier.lit(CHEMIN_FICHIER_ENV_CODEX);
    }
    const lesVariablesEnvironnement = parseEnv(variablesProxy);
    const portLiteLLM = Number(lesVariablesEnvironnement.PORT_LITE_LLM) || 4000;
    return {
      // Clé fournie dans le .env racine (créée côté proxy : app LiteLLM distante ou conteneur local).
      jeton: process.env.LITELLM_API_KEY || '',
      image: process.env.CODEX_LITE_LLM_IMAGE || IMAGE_LITE_LLM_PAR_DEFAUT,
      portLiteLLM,
      ...(process.env.LITELLM_DATABASE_URL && {
        urlBaseDeDonnees: process.env.LITELLM_DATABASE_URL,
      }),
    };
  },
};
export const environnement: Environnement = {
  path: process.env.PATH!,
  fournisseur: (): EnvironnementFournisseur => ({
    apiKey: process.env.FOURNISSEUR_API_KEY || '',
    modele: process.env.FOURNISSEUR_MODELE || '',
    nom: process.env.FOURNISSEUR_NOM || '',
    url: process.env.FOURNISSEUR_BASE_URL || '',
  }),
  mattermost: (): { urlWebhook: string } => ({
    urlWebhook: process.env.MATTERMOST_URL || '',
  }),
  urlLiteLLMConfiguree: (): string =>
    process.env.LITELLM_BASE_URL?.replace(/\/+$/, '') || '',
  pourCodexSecurity: (): EnvironnementCodexSecurity => variablesCodexSecurity,
  pourShannon: (systemeDeFichier: SystemeDeFichier): EnvironnementShannon => {
    const variablesShannon = systemeDeFichier.lit(CHEMIN_FICHIER_ENV_SHANNON);
    const lesVariablesEnvironnement = parseEnv(variablesShannon);
    return {
      apiKey: lesVariablesEnvironnement.SHANNON_AI_API_KEY!,
      model: lesVariablesEnvironnement.SHANNON_AI_MODEL!,
      nombreEssais: Number(process.env.RUNS) || 5,
      portTestDeFumee: Number(process.env.SMOKE_PORT) || 8080,
      testPipelineActive: process.env.TEST_PIPELINE_ACTIVE === 'true',
      espaceDeTravail: process.env.SHANNON_ESPACE_DE_TRAVAIL || '',
    };
  },
  verifiePresenceFichierRacine(systemeDeFichier: SystemeDeFichier) {
    if (!systemeDeFichier.existe(CHEMIN_FICHIER_ENV_RACINE)) {
      throw new Error(
        'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
      );
    }
    const lesVariables = parseEnv(systemeDeFichier.lit(CHEMIN_FICHIER_ENV_RACINE));
    if (!lesVariables.FOURNISSEUR_API_KEY) {
      throw new Error('Erreur: FOURNISSEUR_API_KEY manquant ou vide dans .env');
    }
    if (!lesVariables.FOURNISSEUR_BASE_URL) {
      throw new Error('Erreur: FOURNISSEUR_BASE_URL manquant ou vide dans .env');
    }
    if (!lesVariables.FOURNISSEUR_MODELE) {
      throw new Error('Erreur: FOURNISSEUR_MODELE manquant ou vide dans .env');
    }
    if (!lesVariables.LITELLM_BASE_URL) {
      throw new Error('Erreur: LITELLM_BASE_URL manquant ou vide dans .env');
    }
    if (!lesVariables.LITELLM_API_KEY) {
      throw new Error('Erreur: LITELLM_API_KEY manquant ou vide dans .env');
    }
  },
};
