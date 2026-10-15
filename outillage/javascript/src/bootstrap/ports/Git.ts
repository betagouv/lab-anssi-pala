import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';

export interface Git {
  initialiseSousModules(): Promise<void>;
  // Clone la cible dans sa copie de travail.
  cloneCible(cible: CibleBootstrap): Promise<void>;
}
