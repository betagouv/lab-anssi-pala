import type { Appareil } from './appareil.ts';

export type ContexteEnrolement = {
  nom: string;
  identifiantUtilisateur: string;
  appareil?: Appareil;
  defi?: string;
};
