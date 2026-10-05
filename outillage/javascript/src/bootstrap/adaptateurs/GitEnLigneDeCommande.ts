import { executeCommande } from '../../noyau/adaptateurs/node/processus.ts';
import type { Cible } from '../domaine/Cible.ts';
import type { Git } from '../ports/Git.ts';

export class GitEnLigneDeCommande implements Git {
  readonly #racine: string;

  constructor(racine: string) {
    this.#racine = racine;
  }

  initialiseSousModules(): Promise<void> {
    return executeCommande('git', ['submodule', 'update', '--init', '--recursive'], {
      cwd: this.#racine,
    });
  }

  cloneCible(cible: Cible): Promise<void> {
    const branche = cible.branche ? ['--branch', cible.branche] : [];
    return executeCommande(
      'git',
      ['clone', ...branche, cible.url, cible.copieDeTravail],
      { cwd: this.#racine }
    );
  }
}
