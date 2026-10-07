import type {
  EnvironnementCodexSecurity,
  EnvironnementFournisseur,
  EnvironnementShannon,
  EnvironnementProxy,
} from '../../src/noyau/environnement.ts';

export const ENVIRONNEMENT_SHANNON: EnvironnementShannon = {
  apiKey: 'cle-shannon',
  model: 'albert:openai/gpt-oss-120b',
  nombreEssais: 1,
  portTestDeFumee: 8080,
  testPipelineActive: false,
  espaceDeTravail: 'espace-de-travail',
};

export const ENVIRONNEMENT_PROXY: EnvironnementProxy = {
  FOURNISSEUR_NOM: 'albert',
  FOURNISSEUR_API_KEY: 'cle-fournisseur',
  FOURNISSEUR_BASE_URL: 'https://fournisseur.example/v1',
  LITELLM_MASTER_KEY: 'sk-local-neuf',
  CODEX_API_KEY: 'sk-local-neuf',
  image: 'image',
};

export const ENVIRONNEMENT_FOURNISSEUR: EnvironnementFournisseur = {
  nom: 'albert',
  apiKey: 'clef-fournisseur',
  url: 'http://fournisseur.local',
};

export const ENVIRONNEMENT_CODEX_SECURITY: EnvironnementCodexSecurity = {
  cible: 'cible',
  portLiteLLM: 4000,
  sortie: 'sortie',
  config: 'config',
  proxy: () => ENVIRONNEMENT_PROXY,
};
