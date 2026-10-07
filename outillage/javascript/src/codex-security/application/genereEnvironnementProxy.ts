// Génère l'environnement du proxy LiteLLM à partir du .env racine. Portage TS de generate-env.sh.
import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type { GenerateurDeJeton } from '../ports/GenerateurDeJeton.ts';
import { environnement } from '../../noyau/environnement.ts';
import { CHEMIN_FICHIER_ENV_CODEX } from '../domaine/cheminEnvironnement.ts';
import type { GenerationEnvironnement } from './demarreProxy.ts';

export type Dependances = {
  systemeDeFichier: SystemeDeFichier;
  generateurDeJeton: GenerateurDeJeton;
  console: Console;
};

export class GenereEnvironnementProxy implements GenerationEnvironnement {
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
    const environnementProxy = environnement
      .pourCodexSecurity()
      .proxy(this.#systemeDeFichier);
    const fournisseur = environnement.fournisseur();

    const toutesLesVariables = () => {
      let jetonLocal = environnementProxy.LITELLM_MASTER_KEY;
      if (!jetonLocal || !jetonLocal.startsWith('sk-')) {
        jetonLocal = this.#generateurDeJeton.jetonLocal();
      }
      return `${Object.entries({
        ...environnementProxy,
        FOURNISSEUR_NOM: fournisseur.nom,
        FOURNISSEUR_API_KEY: fournisseur.apiKey,
        FOURNISSEUR_BASE_URL: fournisseur.url,
        LITELLM_MASTER_KEY: jetonLocal,
        CODEX_API_KEY: jetonLocal,
      })
        .filter(([nom, valeur]) => nom !== 'image')
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
      'BLEU'
    );
  }
}
