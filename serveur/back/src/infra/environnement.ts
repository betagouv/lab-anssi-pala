export type ParametresEnrolement = {
  nomDuService: string;
  domaine: string;
  origine: string;
};

export type Environnement = {
  trustProxy: () => string | number;
  enrolement: () => ParametresEnrolement;
};
