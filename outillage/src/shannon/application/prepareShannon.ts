import type { PreparationOutil } from '../../bootstrap/domaine/PreparationOutil.ts';
import type { Console } from '../../noyau/ports/Console.ts';
import type { DepotShannon } from '../ports/DepotShannon.ts';

export class PrepareShannon implements PreparationOutil {
  readonly nom = 'shannon';
  readonly fichierEnvironnement = 'outils/shannon/shannon.env';
  readonly #depot: DepotShannon;
  readonly #console: Console;

  constructor({ depot, console }: { depot: DepotShannon; console: Console }) {
    this.#depot = depot;
    this.#console = console;
  }

  async prepare(): Promise<void> {
    for (const patch of this.#depot.patchsLocaux()) {
      if (await this.#depot.patchApplicable(patch)) {
        await this.#depot.appliquePatch(patch);
        this.#console.aLaLigne(`    patch appliqué : ${patch}`, 'VERT');
      } else {
        this.#console.aLaLigne(
          `    patch déjà appliqué (ou non applicable en l'état) : ${patch}`,
          'VERT'
        );
      }
    }
    if (!this.#depot.cliEstConstruite()) {
      await this.#depot.construitCli();
      this.#console.aLaLigne('    construit : CLI Shannon', 'VERT');
    }
  }
}
