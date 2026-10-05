// Préparation propre à Shannon, appelée par le bootstrap après l'initialisation des sous-modules :
// réapplique les patchs locaux sur les sources amont. Portage TS de outils/shannon/bootstrap.sh.
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

  // Idempotent : un patch déjà appliqué est laissé tel quel.
  async prepare(): Promise<void> {
    for (const patch of this.#depot.patchsLocaux()) {
      if (await this.#depot.patchApplicable(patch)) {
        await this.#depot.appliquePatch(patch);
        this.#console.affiche(`    patch appliqué : ${patch}`, 'VERT');
      } else {
        this.#console.affiche(
          `    patch déjà appliqué (ou non applicable en l'état) : ${patch}`,
          'VERT'
        );
      }
    }
  }
}
