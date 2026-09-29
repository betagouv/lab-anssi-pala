export interface SystemeDeFichier {
  lit(chemin: string): string;
  existe(chemin: string): boolean;
  // Crée le dossier et ses parents ; sans effet s'il existe déjà.
  creeDossier(chemin: string): void;
  // Écrit (ou remplace) un fichier lisible par son seul propriétaire (600) : secrets.
  ecritFichierPrive(chemin: string, contenu: string): void;
}
