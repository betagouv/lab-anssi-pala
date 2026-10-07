// Prépare l'exécution de Codex Security contre le proxy LiteLLM local, commune au scan et à la
// validation : vérifie les prérequis, résout cible, config et sortie, et construit l'environnement
// du processus Codex. Portage TS de env-runtime.sh.
import { join } from 'node:path';
import type { Horloge } from '../../noyau/ports/Horloge.ts';
import type { Reseau } from '../../noyau/ports/Reseau.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { DossierDeSortie } from '../domaine/DossierDeSortie.ts';
import type { CliCodexSecurity } from '../ports/CliCodexSecurity.ts';
import { environnement } from '../../noyau/environnement.ts';
import { CHEMIN_FICHIER_ENV_CODEX } from '../domaine/cheminEnvironnement.ts';

export type DependancesExecution = {
  // Racine absolue du dépôt d'audit : les chemins transmis à Codex doivent être absolus.
  racine: string;
  cli: CliCodexSecurity;
  systemeDeFichier: SystemeDeFichier;
  reseau: Reseau;
  horloge: Horloge;
};

export type ExecutionCodex = {
  cible: string;
  config: string;
  sortie: DossierDeSortie;
  environnementCodex: EnvironnementCodex;
};

export type EnvironnementCodex = {
  LITELLM_API_KEY: string;
  CODEX_API_KEY: string;
  CODEX_HOME: string;
  CODEX_SECURITY_STATE_DIR: string;
  CODEX_SECURITY_NO_UPDATE_NOTICE: string;
  CODEX_SCAN_ECRIT_ARTEFACTS: string;
};

export class PrepareExecutionCodex {
  readonly #racine: string;
  readonly #cli: CliCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #reseau: Reseau;
  readonly #horloge: Horloge;

  constructor({
    racine,
    cli,
    systemeDeFichier,
    reseau,
    horloge,
  }: DependancesExecution) {
    this.#racine = racine;
    this.#cli = cli;
    this.#systemeDeFichier = systemeDeFichier;
    this.#reseau = reseau;
    this.#horloge = horloge;
  }

  // nature : préfixe du dossier de sortie horodaté (scan, validate).
  async pour(nature: string): Promise<ExecutionCodex> {
    const environnementCodex = environnement.pourCodexSecurity();
    const cible = await this.#verifiePrerequis();
    const sortie = environnementCodex.sortie
      ? new DossierDeSortie(environnementCodex.sortie)
      : DossierDeSortie.horodate(this.#racine, nature, this.#horloge.maintenant());
    this.#systemeDeFichier.creeDossierPrive(sortie.chemin);
    return {
      cible,
      // Défaut : DeepSeek servi par Albert, dépôt entier. Scan ciblé : copier config-cible.template.yaml.
      config:
        environnementCodex.config ||
        join(this.#racine, 'outils/codex-security/configs/config-defaut.yaml'),
      sortie,
      environnementCodex: this.#environnementCodex(),
    };
  }

  async #verifiePrerequis(): Promise<string> {
    if (!this.#cli.estInstallee())
      throw new Error(
        'CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)'
      );
    if (!this.#systemeDeFichier.existe(CHEMIN_FICHIER_ENV_CODEX)) {
      throw new Error(
        `Fichier manquant : ${CHEMIN_FICHIER_ENV_CODEX} (lancer pnpm start-proxy)`
      );
    }
    const cible = environnement.pourCodexSecurity().cible;

    if (!cible) {
      throw new Error(
        'CIBLE non défini : indiquer la cible, ex. CIBLE="$PWD/cible/copies/<nom>" (voir pnpm bootstrap --project <nom> --url <git-url>)'
      );
    }
    if (!this.#systemeDeFichier.existe(cible)) {
      throw new Error(
        `Cible manquante : ${cible} (cloner via pnpm bootstrap --project <nom> --url <git-url>)`
      );
    }
    const port = environnement.pourCodexSecurity().portLiteLLM;
    if (!(await this.#reseau.repond(`http://127.0.0.1:${port}/health/liveliness`))) {
      throw new Error(
        `Proxy LiteLLM injoignable sur 127.0.0.1:${port} (lancer pnpm start-proxy)`
      );
    }
    return cible;
  }

  #environnementCodex(): EnvironnementCodex {
    const jeton = environnement
      .pourCodexSecurity()
      .proxy(this.#systemeDeFichier).LITELLM_MASTER_KEY;
    // Identité et historique Codex isolés : rien n'est lu ni écrit dans ~/.codex.
    const codexHome = join(this.#racine, 'outils/codex-security/codex-home');
    const etat = join(this.#racine, 'outils/codex-security/state');
    this.#systemeDeFichier.creeDossierPrive(codexHome);
    this.#systemeDeFichier.creeDossierPrive(etat);
    return {
      LITELLM_API_KEY: jeton,
      CODEX_API_KEY: jeton,
      CODEX_HOME: codexHome,
      CODEX_SECURITY_STATE_DIR: etat,
      CODEX_SECURITY_NO_UPDATE_NOTICE: '1',
      CODEX_SCAN_ECRIT_ARTEFACTS: join(
        this.#racine,
        'outils/codex-security/scripts/ecrit-artefacts-scan.py'
      ),
    };
  }
}
