export interface Console {
  affiche(ligne: string): void;
  signaleErreur(ligne: string): void;
}
