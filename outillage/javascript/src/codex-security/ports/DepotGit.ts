export interface DepotGit {
  // Fichiers modifiés dans le dépôt `repertoireDepot` sur les `nombreDeJours` derniers jours
  // glissants (chemins relatifs à ce dépôt), triés et dédupliqués. Délimite un scan ciblé.
  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[];
}
