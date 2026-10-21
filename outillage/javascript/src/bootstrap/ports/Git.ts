import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';

export type Modifications = {
  premierCommit?: string;
  dernierCommit?: string;
  liste: string[];
};

export interface Git {
  initialiseSousModules(): Promise<void>;
  cloneCible(cible: CibleBootstrap): Promise<void>;
  metAJour(repertoireDepot: string): void;
  fichiersModifiesDepuis(
    repertoireDepot: string,
    nombreDeJours: number
  ): Modifications;
}
