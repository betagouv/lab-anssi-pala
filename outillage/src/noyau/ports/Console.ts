export type Couleur =
  'NOIR' | 'GRIS' | 'VERT' | 'BLEU' | 'JAUNE' | 'ROUGE' | 'VIOLET' | 'ORANGE';

const NOIR = '\x1b[38;2;45;52;70m';
const GRIS = '\x1b[38;2;99;110;114m';
const VERT = '\x1b[38;2;85;239;196m';
const BLEU = '\x1b[38;2;116;185;255m';
const JAUNE = '\x1b[38;2;255;234;167m';
const ROUGE = '\x1b[38;2;255;118;117m';
const VIOLET = '\x1b[38;2;162;155;254m';
const ORANGE = '\x1b[38;2;250;177;160m';

export const couleurs: Record<Couleur, string> = {
  NOIR,
  GRIS,
  VERT,
  BLEU,
  JAUNE,
  ROUGE,
  VIOLET,
  ORANGE,
};

export interface Console {
  aLaLigne(ligne: string, couleur?: Couleur): void;

  sureUneSeuleLigne(texte: string, couleur?: Couleur): void;

  signaleErreur(ligne: string): void;
}
