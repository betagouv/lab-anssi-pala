import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { environnement } from '../../noyau/environnement.ts';
import { CHEMIN_FICHIER_ENV_SHANNON } from '../../codex-security/domaine/cheminEnvironnement.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  console: Console;
};

export class GenereEnvironnement {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #console: Console;

  constructor({ systemeDeFichier, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#console = console;
  }

  execute(): void {
    environnement.verifiePresenceFichierRacine(this.#systemeDeFichier);
    this.#genereLeFichierEnvPourShannon();
  }

  #genereLeFichierEnvPourShannon() {
    const fournisseur = environnement.fournisseur();
    const toutesLesVariables = () => {
      return `${Object.entries({
        SHANNON_AI_MODEL: `${fournisseur.nom}:${fournisseur.modele}`,
        SHANNON_AI_API_KEY: fournisseur.apiKey,
      })
        .map(([nom, valeur]) => `${nom}=${valeur}`)
        .join('\n')}\n`;
    };

    this.#systemeDeFichier.ecritFichierPrive(
      CHEMIN_FICHIER_ENV_SHANNON,
      toutesLesVariables()
    );
    this.#console.aLaLigne(`Généré: ${CHEMIN_FICHIER_ENV_SHANNON}`, 'VERT');
    this.#console.aLaLigne(
      `  Fournisseur configuré pour Shannon : ${fournisseur.nom} (${fournisseur.modele})`,
      'VERT'
    );
  }
}
