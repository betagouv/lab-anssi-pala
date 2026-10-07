// Génère l'environnement du proxy LiteLLM à partir du .env racine. Portage TS de generate-env.sh.
import { parseEnv } from 'node:util';
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

    const toutesLesVariables = () => {
      let jetonLocal = environnementProxy.LITELLM_MASTER_KEY;
      if (!jetonLocal || !jetonLocal.startsWith('sk-')) {
        jetonLocal = this.#generateurDeJeton.jetonLocal();
      }
      return `${Object.entries({
        ...environnementProxy,
        ALBERT_API_KEY: environnement.fournisseur().apiKey,
        ALBERT_BASE_URL: environnement.fournisseur().url,
        LITELLM_MASTER_KEY: jetonLocal,
        CODEX_API_KEY: jetonLocal,
        ...(environnement.SCALEWAY_DEEPSEEK_API_KEY && {
          SCALEWAY_DEEPSEEK_API_KEY: environnement.SCALEWAY_DEEPSEEK_API_KEY,
        }),
      })
        .filter(([nom, valeur]) => nom !== 'image')
        .map(([nom, valeur]) => `${nom}=${valeur}`)
        .join('\n')}\n`;
    };

    const fournisseurs = () => {
      const albert = `Albert (${environnementProxy.ALBERT_BASE_URL})`;
      return environnementProxy.SCALEWAY_DEEPSEEK_API_KEY
        ? `${albert} + Scaleway (DeepSeek)`
        : `${albert} ; Scaleway absent (SCALEWAY_DEEPSEEK_API_KEY non renseignée dans .env)`;
    };
    this.#systemeDeFichier.ecritFichierPrive(
      CHEMIN_FICHIER_ENV_CODEX,
      toutesLesVariables()
    );
    this.#console.aLaLigne(`Généré: ${CHEMIN_FICHIER_ENV_CODEX}`, 'VERT');
    this.#console.aLaLigne(
      `  Fournisseurs configurés pour le proxy : ${fournisseurs()}`,
      'BLEU'
    );
  }
  // Le jeton existant est conservé pour ne pas invalider un proxy en marche.
  #jetonLocal(): string {
    return this.#jetonExistant() ?? this.#generateurDeJeton.jetonLocal();
  }

  #jetonExistant(): string | undefined {
    if (!this.#systemeDeFichier.existe(CHEMIN_FICHIER_ENV_CODEX)) return undefined;
    const jeton = parseEnv(
      this.#systemeDeFichier.lit(CHEMIN_FICHIER_ENV_CODEX)
    ).LITELLM_MASTER_KEY;
    return jeton?.startsWith('sk-') ? jeton : undefined;
  }
}
