export type ParametresEnrolement = {
  secretDeSession: string;
  nomDuService: string;
  domaine: string;
  origine: string;
};

export type ParametresServeur = {
  port: number;
  hote: string;
};

type RateLimit = {
  nombreRequetesParMinute: number;
  nombreRequetesParMinuteSurPointSensible: number;
};

export type Environnement = {
  trustProxy: () => string | number;
  enrolement: () => ParametresEnrolement;
  rateLimit: () => RateLimit;
  serveur: () => ParametresServeur;
  verifieLesVariablesNecessaires: () => void;
};
