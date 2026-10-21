import type { CibleBootstrap } from '../../src/bootstrap/domaine/CibleBootstrap.ts';
import type { Git, Modifications } from '../../src/bootstrap/ports/Git.ts';

export class GitMemoire implements Git {
  readonly #fichiers: string[];
  repertoireDemande?: string;
  nombreDeJoursDemande?: number;
  repertoireMisAJour?: string;
  misAJourAvantLeDiff = false;
  sousModulesInitialises = false;
  readonly clonages: { url: string; branche?: string; copie: string }[] = [];

  constructor(fichiers: string[] = []) {
    this.#fichiers = fichiers;
  }

  async initialiseSousModules(): Promise<void> {
    this.sousModulesInitialises = true;
  }

  async cloneCible(cible: CibleBootstrap): Promise<void> {
    this.clonages.push({
      url: cible.url,
      branche: cible.branche,
      copie: cible.copieDeTravail,
    });
  }

  metAJour(repertoireDepot: string): void {
    this.repertoireMisAJour = repertoireDepot;
  }

  fichiersModifiesDepuis(
    repertoireDepot: string,
    nombreDeJours: number
  ): Modifications {
    this.misAJourAvantLeDiff = this.repertoireMisAJour === repertoireDepot;
    this.repertoireDemande = repertoireDepot;
    this.nombreDeJoursDemande = nombreDeJours;
    return { liste: this.#fichiers };
  }
}
