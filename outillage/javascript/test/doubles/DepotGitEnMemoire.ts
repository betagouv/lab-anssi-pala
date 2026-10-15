import type { DepotGit } from '../../src/codex-security/ports/DepotGit.ts';

export class DepotGitEnMemoire implements DepotGit {
  readonly #fichiers: string[];
  repertoireDemande?: string;
  nombreDeJoursDemande?: number;

  constructor(fichiers: string[] = []) {
    this.#fichiers = fichiers;
  }

  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[] {
    this.repertoireDemande = repertoireDepot;
    this.nombreDeJoursDemande = nombreDeJours;
    return this.#fichiers;
  }
}
