export interface SystemeDeFichier {
  lit(chemin: string): string;
  existe(chemin: string): boolean;
  // Crée le dossier et ses parents ; sans effet s'il existe déjà.
  creeDossier(chemin: string): void;
  // Comme creeDossier, accessible à son seul propriétaire (700).
  creeDossierPrive(chemin: string): void;
  // Écrit (ou remplace) un fichier.
  ecritFichier(chemin: string, contenu: string): void;
  // Écrit (ou remplace) un fichier lisible par son seul propriétaire (600) : secrets.
  ecritFichierPrive(chemin: string, contenu: string): void;
}
