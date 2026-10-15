import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { GenerateurDeJeton } from '../../codex-security/ports/GenerateurDeJeton.ts';
import { environnement } from '../../noyau/environnement.ts';
import {
  CHEMIN_FICHIER_ENV_CODEX,
  CHEMIN_FICHIER_ENV_SHANNON,
} from '../../codex-security/domaine/cheminEnvironnement.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  generateurDeJeton: GenerateurDeJeton;
  console: Console;
};

export class GenereEnvironnement {
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #generateurDeJeton: GenerateurDeJeton;
  readonly #console: Console;

  constructor({ systemeDeFichier, generateurDeJeton, console }: Dependances) {
    this.#systemeDeFichier = systemeDeFichier;
    this.#generateurDeJeton = generateurDeJeton;
    this.#console = console;
  }

  execute(): void {
    environnement.verifiePresenceFichierRacine(this.#systemeDeFichier);
    this.#genereLeFichierEnvPourCodexSecurity();
    this.#genereLeFichierEnvPourShannon();
  }

  #genereLeFichierEnvPourCodexSecurity() {
    const environnementProxy = environnement
      .pourCodexSecurity()
      .proxy(this.#systemeDeFichier);
    const fournisseur = environnement.fournisseur();

    const urlProxy = environnement.urlLiteLLMConfiguree();
    const toutesLesVariables = () => {
      let jetonLocal = environnementProxy.jeton;
      if (!jetonLocal || !jetonLocal.startsWith('sk-')) {
        jetonLocal = this.#generateurDeJeton.jetonLocal();
      }
      return `${Object.entries({
        FOURNISSEUR_NOM: fournisseur.nom,
        FOURNISSEUR_API_KEY: fournisseur.apiKey,
        FOURNISSEUR_BASE_URL: fournisseur.url,
        ...(urlProxy && { LITELLM_BASE_URL: urlProxy }),
        LITELLM_API_KEY: jetonLocal,
        CODEX_API_KEY: jetonLocal,
      })
        .map(([nom, valeur]) => `${nom}=${valeur}`)
        .join('\n')}\n`;
    };

    this.#systemeDeFichier.ecritFichierPrive(
      CHEMIN_FICHIER_ENV_CODEX,
      toutesLesVariables()
    );
    this.#console.aLaLigne(`Généré: ${CHEMIN_FICHIER_ENV_CODEX}`, 'VERT');
    this.#console.aLaLigne(
      `  Fournisseur configuré pour le proxy : ${fournisseur.nom} (${fournisseur.url})`,
      'VERT'
    );
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
