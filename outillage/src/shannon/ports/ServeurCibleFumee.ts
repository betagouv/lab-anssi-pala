// Cible triviale (outils/shannon/smoke-target) servie sur 127.0.0.1 le temps d'un passage de fumée.
export interface ServeurCibleFumee {
  demarre(port: number): Promise<void>;
  arrete(): Promise<void>;
}
