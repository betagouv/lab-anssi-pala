import type { Cible } from "../domaine/Cible.ts";

export interface Git {
  initialiseSousModules(): Promise<void>;
  // Clone la cible dans sa copie de travail.
  cloneCible(cible: Cible): Promise<void>;
}
