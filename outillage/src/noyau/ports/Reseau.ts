export interface Reseau {
  // Vrai si un serveur répond à l'URL, quel que soit le statut HTTP.
  repond(url: string): Promise<boolean>;
}
