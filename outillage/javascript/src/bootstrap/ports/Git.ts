import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';

export interface Git {
  initialiseSousModules(): Promise<void>;
  cloneCible(cible: CibleBootstrap): Promise<void>;
  metAJour(repertoireDepot: string): void;
  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[];
}
