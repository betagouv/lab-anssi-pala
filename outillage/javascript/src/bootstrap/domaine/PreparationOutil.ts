// Préparation propre à un outil d'audit (installation, patchs…), inscrite au registre du bootstrap.
// Idempotente : peut être relancée sans effet de bord.
export interface PreparationOutil {
  readonly nom: string;
  // Fichier d'environnement de l'outil (non versionné), à créer depuis son modèle « <fichier>.template ».
  readonly fichierEnvironnement: string;
  prepare(): Promise<void>;
}
