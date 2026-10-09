// Lance un scan Codex Security sur la copie de travail d'une cible, via le proxy LiteLLM local, puis
// en estime le coût. Portage TS de run-scan.sh.
import { join } from 'node:path';
import type { Console } from '../../noyau/ports/Console.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import { ConfigScan } from '../domaine/ConfigScan.ts';
import type { DossierDeSortie } from '../domaine/DossierDeSortie.ts';
import type { ScannerCodexSecurity } from '../ports/ScannerCodexSecurity.ts';
import {
  type DependancesExecution,
  PrepareExecutionCodex,
} from './prepareExecutionCodex.ts';
import type { EstimationDuCout } from '../../cout/application/estimationDuCout.ts';
import {
  type ConsommationDeTokens,
  unReleveDeConsommationDeTokensCodex,
} from '../../cout/domaine/consommationDeTokens.ts';
import { environnement } from '../../noyau/environnement.ts';

export type Dependances = DependancesExecution & {
  estimation: EstimationDuCout;
  console: Console;
};

type CommandeScan = { options: string[]; cible: string; config: string };

export class LanceScan {
  readonly #racine: string;
  readonly #execution: PrepareExecutionCodex;
  readonly #scanner: ScannerCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #estimation: EstimationDuCout;
  readonly #console: Console;

  constructor(dependances: Dependances) {
    this.#racine = dependances.racine;
    this.#execution = new PrepareExecutionCodex(dependances);
    this.#scanner = dependances.scanner;
    this.#systemeDeFichier = dependances.systemeDeFichier;
    this.#estimation = dependances.estimation;
    this.#console = dependances.console;
  }

  async execute(
    { options, cible, config }: CommandeScan,
    releveDeTokens: (
      log: string,
      fournisseur: string,
      modele: string
    ) => ConsommationDeTokens | null = unReleveDeConsommationDeTokensCodex
  ): Promise<number> {
    const { sortie, environnementCodex } = await this.#execution.pour('scan', cible);
    this.#console.aLaLigne(`Cible  : ${cible}`, 'VIOLET');
    this.#console.aLaLigne(`Config : ${config}`, 'ORANGE');
    this.#console.aLaLigne(`Sortie : ${sortie.chemin}`, 'BLEU');

    const statut = await this.#scanner.scanne({
      cible,
      config,
      sortie: sortie.chemin,
      journal: sortie.journal,
      options: this.#optionsDuScan(options),
      environnement: { ...environnementCodex, PATH: environnement.path },
    });
    this.#estimeLeCout(config, sortie, releveDeTokens);
    return statut;
  }

  #optionsDuScan(options: string[]): string[] {
    const consignes = join(
      this.#racine,
      'outils/codex-security/configs/consignes-scan.md'
    );
    const fournie = (option: string) =>
      options.some((o) => o === option || o.startsWith(`${option}=`));
    return [
      ...(fournie('--scan-prompt-file') ? [] : ['--scan-prompt-file', consignes]),
      ...(fournie('--verbose') ? [] : ['--verbose']),
      ...options,
    ];
  }

  #estimeLeCout(
    config: string,
    sortie: DossierDeSortie,
    releveDeTokens: (
      log: string,
      fournisseur: string,
      modele: string
    ) => ConsommationDeTokens | null
  ): void {
    try {
      const { modele, fournisseur } = ConfigScan.depuisYaml(
        this.#systemeDeFichier.lit(config)
      );
      const consommation = releveDeTokens(
        this.#systemeDeFichier.lit(sortie.journal),
        fournisseur,
        modele
      );
      this.#estimation.rapporte(consommation);
    } catch (erreur) {
      this.#console.signaleErreur(
        `Estimation du coût impossible : ${erreur instanceof Error ? erreur.message : erreur}`
      );
    }
  }
}
