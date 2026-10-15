import type { DepotGit } from '../../src/codex-security/ports/DepotGit.ts';

export class DepotGitEnMemoire implements DepotGit {
  readonly #fichiers: string[];
  repertoireDemande?: string;
  nombreDeJoursDemande?: number;
  repertoireMisAJour?: string;
  misAJourAvantLeDiff = false;

  constructor(fichiers: string[] = []) {
    this.#fichiers = fichiers;
  }

  metAJour(repertoireDepot: string): void {
    this.repertoireMisAJour = repertoireDepot;
  }

  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[] {
    this.misAJourAvantLeDiff = this.repertoireMisAJour === repertoireDepot;
    this.repertoireDemande = repertoireDepot;
    this.nombreDeJoursDemande = nombreDeJours;
    return this.#fichiers;
  }
}
