export interface Console {
  affiche(ligne: string): void;
  // Écrit sans aller à la ligne (progression) ; la ligne est terminée par le prochain affiche.
  ecrit(texte: string): void;
  signaleErreur(ligne: string): void;
}
