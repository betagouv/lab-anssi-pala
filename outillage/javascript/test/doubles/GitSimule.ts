import type { Cible } from "../../src/bootstrap/domaine/Cible.ts";
import type { Git } from "../../src/bootstrap/ports/Git.ts";

export class GitSimule implements Git {
  sousModulesInitialises = false;
  readonly clonages: { url: string; branche?: string; copie: string }[] = [];

  async initialiseSousModules(): Promise<void> {
    this.sousModulesInitialises = true;
  }

  async cloneCible(cible: Cible): Promise<void> {
    this.clonages.push({ url: cible.url, branche: cible.branche, copie: cible.copieDeTravail });
  }
}
