// Sources amont de Shannon (sous-module outils/shannon/source) et patchs locaux (outils/shannon/patches).
export interface DepotShannon {
  patchsLocaux(): string[];
  // Faux si le patch est déjà appliqué ou ne s'applique pas sur les sources en l'état.
  patchApplicable(patch: string): Promise<boolean>;
  appliquePatch(patch: string): Promise<void>;
}
