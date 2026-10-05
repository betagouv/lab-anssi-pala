import type { Console, Couleur } from '../../src/noyau/ports/Console.ts';

type Ligne = {
  message: string;
  couleur: string;
};

type LigneEnErreur = Omit<Ligne, 'couleur'> & {
  couleur: 'NOIR';
};

export class ConsoleEnMemoire implements Console {
  readonly lignes: Ligne[] = [];
  readonly erreurs: LigneEnErreur[] = [];
  readonly traces: string[] = [];
  #ligneEnCours = '';

  affiche(ligne: string, couleur: Couleur = 'NOIR'): void {
    this.lignes.push({ message: this.#ligneEnCours + ligne, couleur: couleur });
    this.#ligneEnCours = '';
  }

  ecrit(texte: string, couleur: Couleur = 'NOIR'): void {
    this.#ligneEnCours += texte;
  }

  signaleErreur(ligne: string): void {
    this.erreurs.push({ message: ligne, couleur: 'NOIR' });
  }

  trace(ligne: string): void {
    this.traces.push(ligne);
  }
}
