// Prépare l'exécution de Codex Security contre le proxy LiteLLM local, commune au scan et à la
// validation : vérifie les prérequis, résout cible, config et sortie, et construit l'environnement
// du processus Codex. Portage TS de env-runtime.sh.
import { join } from "node:path";
import type { Environnement } from "../../noyau/ports/Environnement.ts";
import type { Horloge } from "../../noyau/ports/Horloge.ts";
import type { Reseau } from "../../noyau/ports/Reseau.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { DossierDeSortie } from "../domaine/DossierDeSortie.ts";
import { EnvironnementProxy } from "../domaine/EnvironnementProxy.ts";
import type { CliCodexSecurity } from "../ports/CliCodexSecurity.ts";

export type DependancesExecution = {
  // Racine absolue du dépôt d'audit : les chemins transmis à Codex doivent être absolus.
  racine: string;
  cli: CliCodexSecurity;
  systemeDeFichier: SystemeDeFichier;
  reseau: Reseau;
  horloge: Horloge;
  environnement: Environnement;
};

export type ExecutionCodex = {
  cible: string;
  config: string;
  sortie: DossierDeSortie;
  environnement: Record<string, string | undefined>;
};

export class PrepareExecutionCodex {
  readonly #racine: string;
  readonly #cli: CliCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #reseau: Reseau;
  readonly #horloge: Horloge;
  readonly #environnement: Environnement;

  constructor({ racine, cli, systemeDeFichier, reseau, horloge, environnement }: DependancesExecution) {
    this.#racine = racine;
    this.#cli = cli;
    this.#systemeDeFichier = systemeDeFichier;
    this.#reseau = reseau;
    this.#horloge = horloge;
    this.#environnement = environnement;
  }

  // nature : préfixe du dossier de sortie horodaté (scan, validate).
  async pour(nature: string): Promise<ExecutionCodex> {
    const variables = this.#environnement.variables();
    const cible = await this.#verifiePrerequis(variables);
    const sortie = variables.CODEX_OUTPUT
      ? new DossierDeSortie(variables.CODEX_OUTPUT)
      : DossierDeSortie.horodate(this.#racine, nature, this.#horloge.maintenant());
    this.#systemeDeFichier.creeDossierPrive(sortie.chemin);
    return {
      cible,
      // Défaut : DeepSeek servi par Albert, dépôt entier. Scan ciblé : copier config-cible.template.yaml.
      config: variables.CODEX_CONFIG || join(this.#racine, "outils/codex-security/configs/config-defaut.yaml"),
      sortie,
      environnement: this.#environnementCodex(variables),
    };
  }

  // Renvoie la cible, fournie par CODEX_TARGET (dépôt agnostique : aucune cible par défaut).
  async #verifiePrerequis(variables: Record<string, string | undefined>): Promise<string> {
    if (!this.#cli.estInstallee()) throw new Error("CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)");
    if (!this.#systemeDeFichier.existe(EnvironnementProxy.CHEMIN)) {
      throw new Error(`Fichier manquant : ${EnvironnementProxy.CHEMIN} (lancer pnpm start-proxy)`);
    }
    const cible = variables.CODEX_TARGET;
    if (!cible) {
      throw new Error(
        'CODEX_TARGET non défini : indiquer la cible, ex. CODEX_TARGET="$PWD/cible/copies/<nom>" (voir pnpm bootstrap --project <nom> --url <git-url>)',
      );
    }
    if (!this.#systemeDeFichier.existe(cible)) {
      throw new Error(`Cible manquante : ${cible} (cloner via pnpm bootstrap --project <nom> --url <git-url>)`);
    }
    const port = variables.LITELLM_PORT || "4000";
    if (!(await this.#reseau.repond(`http://127.0.0.1:${port}/health/liveliness`))) {
      throw new Error(`Proxy LiteLLM injoignable sur 127.0.0.1:${port} (lancer pnpm start-proxy)`);
    }
    return cible;
  }

  // Le jeton local du proxy est la seule clé transmise à Codex ; la clé Albert reste dans le proxy.
  // Codex Security refuse de démarrer en mode api-key sans OPENAI_API_KEY/CODEX_API_KEY : on lui
  // fournit le même jeton, qui n'est envoyé qu'au fournisseur configuré (le proxy).
  #environnementCodex(variables: Record<string, string | undefined>): Record<string, string | undefined> {
    const jeton = EnvironnementProxy.depuisContenu(this.#systemeDeFichier.lit(EnvironnementProxy.CHEMIN)).jetonLocal;
    const { OPENAI_API_KEY: _jamaisTransmise, ...shell } = variables;
    // Identité et historique Codex isolés : rien n'est lu ni écrit dans ~/.codex.
    const codexHome = join(this.#racine, "outils/codex-security/codex-home");
    const etat = join(this.#racine, "outils/codex-security/state");
    this.#systemeDeFichier.creeDossierPrive(codexHome);
    this.#systemeDeFichier.creeDossierPrive(etat);
    return {
      ...shell,
      LITELLM_API_KEY: jeton,
      CODEX_API_KEY: jeton,
      CODEX_HOME: codexHome,
      CODEX_SECURITY_STATE_DIR: etat,
      CODEX_SECURITY_NO_UPDATE_NOTICE: "1",
      // Script d'écriture des artefacts appelé par l'agent (configs/consignes-scan.md, étape 4) :
      // il reste en Python, lancé par l'agent via "$PYTHON".
      CODEX_SCAN_ECRIT_ARTEFACTS: join(this.#racine, "outils/codex-security/scripts/ecrit-artefacts-scan.py"),
    };
  }
}
