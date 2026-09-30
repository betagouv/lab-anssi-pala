export interface Console {
  affiche(ligne: string): void;
  // Écrit sans aller à la ligne (progression) ; la ligne est terminée par le prochain affiche.
  ecrit(texte: string): void;
  signaleErreur(ligne: string): void;
  // Information de déroulement, écrite hors de la sortie standard (réservée aux résultats).
  trace(ligne: string): void;
}
