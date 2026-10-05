// Installation locale de Shannon : fichier d'environnement (clé et modèle, non versionné) et CLI
// construite depuis les sources. Commune au pentest et au passage de fumée.
import { parseEnv } from 'node:util';
import type { Environnement } from '../../noyau/ports/Environnement.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';

const ENV_SHANNON = 'outils/shannon/shannon.env';

export class InstallationShannon {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #environnement: Environnement;

  constructor({
    systemeDeFichier,
    environnement,
  }: {
    systemeDeFichier: SystemeDeFichier;
    environnement: Environnement;
  }) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#environnement = environnement;
  }

  verifieEnvironnementRenseigne(): void {
    if (!this.#systemeDeFichier.existe(ENV_SHANNON)) {
      throw new Error(
        `Fichier manquant : ${ENV_SHANNON} (depuis shannon.env.template)`
      );
    }
  }

  verifieCliConstruite(): void {
    if (
      !this.#systemeDeFichier.existe('outils/shannon/source/apps/cli/dist/index.mjs')
    ) {
      throw new Error(
        'CLI Shannon non construite (cd outils/shannon/source && pnpm build)'
      );
    }
  }

  // Comme `set -a; . shannon.env` : l'environnement du shell complété par clé et modèle de Shannon.
  environnement(): Record<string, string | undefined> {
    return {
      ...this.#environnement.variables(),
      ...parseEnv(this.#systemeDeFichier.lit(ENV_SHANNON)),
    };
  }
}
