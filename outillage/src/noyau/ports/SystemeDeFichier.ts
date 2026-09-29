export interface SystemeDeFichier {
  lit(chemin: string): string;
  existe(chemin: string): boolean;
  // Crée le dossier et ses parents ; sans effet s'il existe déjà.
  creeDossier(chemin: string): void;
}
