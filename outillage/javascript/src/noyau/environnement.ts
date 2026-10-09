import type { SystemeDeFichier } from './ports/SystemeDeFichier.ts';
import {
  CHEMIN_FICHIER_ENV_CODEX,
  CHEMIN_FICHIER_ENV_RACINE,
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
  config: string; // TODO: pas une variable d’env => doit être généré
  proxy: (systemeDeFichier: SystemeDeFichier) => EnvironnementProxy;
};

export type EnvironnementProxy = {
  jeton: string;
  image: string;
  urlBaseDeDonnees?: string;
  portLiteLLM: number;
};

export type EnvironnementFournisseur = {
  nom: string;
  apiKey: string;
  url: string;
};

type Environnement = {
  path: string;
  pourShannon: () => EnvironnementShannon;
  pourCodexSecurity: () => EnvironnementCodexSecurity;
  fournisseur: () => EnvironnementFournisseur;
  verifiePresenceFichierRacine(systemeDeFichier: SystemeDeFichier): void;
};

const IMAGE_LITE_LLM_PAR_DEFAUT =
  'ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02';

const variablesCodexSecurity: EnvironnementCodexSecurity = {
  config: process.env.CONFIG || '',
  proxy: (systemeDeFichier: SystemeDeFichier) => {
    let variablesProxy = '';
    if (systemeDeFichier.existe(CHEMIN_FICHIER_ENV_CODEX)) {
      variablesProxy = systemeDeFichier.lit(CHEMIN_FICHIER_ENV_CODEX);
    }
    const lesVariablesEnvironnement = parseEnv(variablesProxy);
    return {
      jeton: lesVariablesEnvironnement.LITELLM_API_KEY!,
      image: process.env.CODEX_LITE_LLM_IMAGE || IMAGE_LITE_LLM_PAR_DEFAUT,
      portLiteLLM: Number(lesVariablesEnvironnement.PORT_LITE_LLM) || 4000,
      ...(process.env.LITELLM_DATABASE_URL && {
        urlBaseDeDonnees: process.env.LITELLM_DATABASE_URL,
      }),
    };
  },
};
export const environnement: Environnement = {
  path: process.env.PATH!,
  fournisseur: (): EnvironnementFournisseur => ({
    nom: process.env.FOURNISSEUR_NOM || '',
    apiKey: process.env.FOURNISSEUR_API_KEY || '',
    url: process.env.FOURNISSEUR_BASE_URL || '',
  }),
  pourCodexSecurity: (): EnvironnementCodexSecurity => variablesCodexSecurity,
  pourShannon: (): EnvironnementShannon => ({
    apiKey: process.env.FOURNISSEUR_API_KEY || '',
    model: process.env.SHANNON_AI_MODEL || '',
    nombreEssais: Number(process.env.RUNS) || 5,
    portTestDeFumee: Number(process.env.SMOKE_PORT) || 8080,
    testPipelineActive: process.env.TEST_PIPELINE_ACTIVE === 'true',
    espaceDeTravail: process.env.SHANNON_ESPACE_DE_TRAVAIL || '',
  }),
  verifiePresenceFichierRacine(systemeDeFichier: SystemeDeFichier) {
    if (!systemeDeFichier.existe(CHEMIN_FICHIER_ENV_RACINE)) {
      throw new Error(
        'Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)'
      );
    }
  },
};
