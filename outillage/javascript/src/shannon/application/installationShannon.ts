import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { CHEMIN_FICHIER_ENV_SHANNON } from '../../codex-security/domaine/cheminEnvironnement.ts';

export class InstallationShannon {
  readonly #systemeDeFichier: SystemeDeFichier;

  constructor({ systemeDeFichier }: { systemeDeFichier: SystemeDeFichier }) {
    this.#systemeDeFichier = systemeDeFichier;
  }

  verifieEnvironnementRenseigne(): void {
    if (!this.#systemeDeFichier.existe(CHEMIN_FICHIER_ENV_SHANNON)) {
      throw new Error(
        `Fichier manquant : ${CHEMIN_FICHIER_ENV_SHANNON} (depuis shannon.env.template)`
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
}
