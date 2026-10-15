import type { CibleBootstrap } from '../../src/bootstrap/domaine/CibleBootstrap.ts';
import type { Git } from '../../src/bootstrap/ports/Git.ts';

export class GitSimule implements Git {
  sousModulesInitialises = false;
  readonly clonages: { url: string; branche?: string; copie: string }[] = [];

  async initialiseSousModules(): Promise<void> {
    this.sousModulesInitialises = true;
  }

  async cloneCible(cible: CibleBootstrap): Promise<void> {
    this.clonages.push({
      url: cible.url,
      branche: cible.branche,
      copie: cible.copieDeTravail,
    });
  }
}
