import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';

export type HashDeCommit = { long: string; court: string };

export type Modifications = {
  premierCommit?: HashDeCommit;
  dernierCommit?: HashDeCommit;
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
