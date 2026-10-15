export interface DepotGit {
  metAJour(repertoireDepot: string): void;

  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[];
}
