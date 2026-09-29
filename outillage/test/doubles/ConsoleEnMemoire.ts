import type { Console } from "../../src/noyau/ports/Console.ts";

export class ConsoleEnMemoire implements Console {
  readonly lignes: string[] = [];
  readonly erreurs: string[] = [];

  affiche(ligne: string): void {
    this.lignes.push(ligne);
  }

  signaleErreur(ligne: string): void {
    this.erreurs.push(ligne);
  }
}
