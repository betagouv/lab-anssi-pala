import type { PreparationOutil } from '../../src/bootstrap/domaine/PreparationOutil.ts';

// Consigne son nom dans un journal partagé quand elle est préparée : permet de vérifier l'ordre.
export class PreparationOutilSimulee implements PreparationOutil {
  readonly nom: string;
  readonly fichierEnvironnement?: string;
  readonly #journal: string[];

  constructor(nom: string, journal: string[] = [], fichierEnvironnement?: string) {
    this.nom = nom;
    this.#journal = journal;
    this.fichierEnvironnement = fichierEnvironnement;
  }

  async prepare(): Promise<void> {
    this.#journal.push(this.nom);
  }
}
