import type { Console } from "../../src/noyau/ports/Console.ts";

export class ConsoleEnMemoire implements Console {
  readonly lignes: string[] = [];
  readonly erreurs: string[] = [];
  #ligneEnCours = "";

  affiche(ligne: string): void {
    this.lignes.push(this.#ligneEnCours + ligne);
    this.#ligneEnCours = "";
  }

  ecrit(texte: string): void {
    this.#ligneEnCours += texte;
  }

  signaleErreur(ligne: string): void {
    this.erreurs.push(ligne);
  }
}
