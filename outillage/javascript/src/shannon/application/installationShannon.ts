// Installation locale de Shannon : fichier d'environnement (clé et modèle, non versionné) et CLI
// construite depuis les sources. Commune au pentest et au passage de fumée.
import { parseEnv } from 'node:util';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { EnvironnementShannonDeLancement } from '../ports/Shannon.ts';

const ENV_SHANNON = 'outils/shannon/shannon.env';

export class InstallationShannon {
  readonly #systemeDeFichier: SystemeDeFichier;

  constructor({ systemeDeFichier }: { systemeDeFichier: SystemeDeFichier }) {
    this.#systemeDeFichier = systemeDeFichier;
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

  environnement(): EnvironnementShannonDeLancement {
    const variables = parseEnv(this.#systemeDeFichier.lit(ENV_SHANNON));
    return {
      SHANNON_AI_API_KEY: variables.SHANNON_AI_API_KEY!,
      SHANNON_AI_MODEL: variables.SHANNON_AI_MODEL!,
      PATH: variables.PATH!,
    };
  }
}
