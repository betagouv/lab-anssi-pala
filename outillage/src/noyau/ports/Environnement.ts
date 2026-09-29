// Variables d'environnement du processus (le shell de l'utilisateur).
export interface Environnement {
  variables(): Record<string, string | undefined>;
}
