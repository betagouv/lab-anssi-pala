import type { SystemeDeFichier } from './ports/SystemeDeFichier.ts';
import {
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
  proxy: () => EnvironnementProxy;
};

export type EnvironnementProxy = {
  jeton: string;
  image: string;
  urlBaseDeDonnees?: string;
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
  urlLiteLLMConfiguree: () => string;
  verifiePresenceVariablesRacine(systemeDeFichier: SystemeDeFichier): void;
};

const IMAGE_LITE_LLM_PAR_DEFAUT =
  'ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02';

const variablesCodexSecurity: EnvironnementCodexSecurity = {
  // Tout vient du .env racine (process.env) : clé créée côté proxy, image et base optionnelles.
  proxy: () => ({
    jeton: process.env.LITELLM_API_KEY || '',
    image: process.env.CODEX_LITE_LLM_IMAGE || IMAGE_LITE_LLM_PAR_DEFAUT,
    ...(process.env.LITELLM_DATABASE_URL && {
      urlBaseDeDonnees: process.env.LITELLM_DATABASE_URL,
    }),
  }),
};
const VARIABLES_RACINE_REQUISES = [
  'FOURNISSEUR_API_KEY',
  'FOURNISSEUR_BASE_URL',
  'FOURNISSEUR_MODELE',
  'LITELLM_BASE_URL',
  'LITELLM_API_KEY',
] as const;

const variablesRacine = (
  systemeDeFichier: SystemeDeFichier
): {
  source: string;
  variables: NodeJS.ProcessEnv;
} => {
  if (process.env.NODE_ENV === 'production') {
    return { source: "l'environnement", variables: process.env };
  }
  if (!systemeDeFichier.existe(CHEMIN_FICHIER_ENV_RACINE)) {
    throw new Error(
      'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
    );
  }
  return {
    source: '.env',
    variables: parseEnv(systemeDeFichier.lit(CHEMIN_FICHIER_ENV_RACINE)),
  };
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
  verifiePresenceVariablesRacine(systemeDeFichier: SystemeDeFichier) {
    const { source, variables } = variablesRacine(systemeDeFichier);
    for (const nom of VARIABLES_RACINE_REQUISES) {
      if (!variables[nom]) {
        throw new Error(`Erreur: ${nom} manquant ou vide dans ${source}`);
      }
    }
  },
};
