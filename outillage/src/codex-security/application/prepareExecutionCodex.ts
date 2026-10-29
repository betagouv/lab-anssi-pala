import { join } from 'node:path';
import type { Attente } from '../../noyau/ports/Attente.ts';
import type { Horloge } from '../../noyau/ports/Horloge.ts';
import type { Reseau } from '../../noyau/ports/Reseau.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { DossierDeSortie } from '../domaine/DossierDeSortie.ts';
import type { ScannerCodexSecurity } from '../ports/ScannerCodexSecurity.ts';
import { environnement } from '../../noyau/environnement.ts';
import type { EnvironnementCodex } from '../ports/EnvironnementCodex.ts';

const TENTATIVES_PROXY = 6;
const DELAI_ENTRE_TENTATIVES_MS = 2000;

export type DependancesExecution = {
  racine: string;
  scanner: ScannerCodexSecurity;
  systemeDeFichier: SystemeDeFichier;
  reseau: Reseau;
  attente: Attente;
  horloge: Horloge;
};

export type ExecutionCodex = {
  sortie: DossierDeSortie;
  environnementCodex: EnvironnementCodex;
};

export class PrepareExecutionCodex {
  readonly #racine: string;
  readonly #cli: ScannerCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #reseau: Reseau;
  readonly #attente: Attente;
  readonly #horloge: Horloge;

  constructor({
    racine,
    scanner,
    systemeDeFichier,
    reseau,
    attente,
    horloge,
  }: DependancesExecution) {
    this.#racine = racine;
    this.#cli = scanner;
    this.#systemeDeFichier = systemeDeFichier;
    this.#reseau = reseau;
    this.#attente = attente;
    this.#horloge = horloge;
  }

  async pour(nature: 'scan' | 'validate', cible: string): Promise<ExecutionCodex> {
    await this.#verifiePrerequis(cible);
    const sortie = DossierDeSortie.horodate(
      this.#racine,
      nature,
      this.#horloge.maintenant()
    );
    this.#systemeDeFichier.creeDossierPrive(sortie.chemin);
    return {
      sortie,
      environnementCodex: this.#environnementCodex(),
    };
  }

  async #verifiePrerequis(cible: string): Promise<void> {
    if (!this.#cli.estInstallee())
      throw new Error(
        'CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)'
      );
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
    await this.#attendLeProxy(environnement.urlLiteLLMConfiguree());
  }

  async #attendLeProxy(urlProxy: string): Promise<void> {
    for (let tentative = 1; tentative <= TENTATIVES_PROXY; tentative++) {
      if (await this.#reseau.repond(`${urlProxy}/health/liveliness`)) return;
      if (tentative < TENTATIVES_PROXY) {
        await this.#attente.attends(DELAI_ENTRE_TENTATIVES_MS);
      }
    }
    throw new Error(
      `Proxy LiteLLM injoignable sur ${urlProxy} ` +
        '(démarrer le proxy local via pnpm démarre-proxy, ou vérifier LITELLM_BASE_URL)'
    );
  }

  #environnementCodex(): EnvironnementCodex {
    const jeton = environnement.pourCodexSecurity().proxy().jeton;
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
