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
  jeton: 'sk-local-neuf',
  image: 'image',
  portLiteLLM: 4000,
};

export const ENVIRONNEMENT_FOURNISSEUR: EnvironnementFournisseur = {
  nom: 'albert',
  apiKey: 'clef-fournisseur',
  url: 'http://fournisseur.local',
};

export const ENVIRONNEMENT_CODEX_SECURITY: EnvironnementCodexSecurity = {
  cible: 'cible',
  sortie: 'sortie',
  config: 'config',
  proxy: () => ENVIRONNEMENT_PROXY,
};
