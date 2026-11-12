export type ParametresEnrolement = {
  secretDeSession: string;
  nomDuService: string;
  domaine: string;
  origine: string;
};

type RateLimit = {
  nombreRequetesParMinute: number;
  nombreRequetesParMinuteSurPointSensible: number;
};

type BaseDeDonnees = {
  active: () => boolean;
};

export type Environnement = {
  trustProxy: () => string | number;
  enrolement: () => ParametresEnrolement;
  rateLimit: () => RateLimit;
  verifieLesVariablesNecessaires: () => void;
  baseDeDonnees: () => BaseDeDonnees;
};
