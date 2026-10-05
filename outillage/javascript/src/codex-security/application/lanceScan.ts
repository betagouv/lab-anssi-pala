// Lance un scan Codex Security sur la copie de travail d'une cible, via le proxy LiteLLM local, puis
// en estime le coût. Portage TS de run-scan.sh.
import { join } from "node:path";
import type { Console } from "../../noyau/ports/Console.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { ConfigScan } from "../domaine/ConfigScan.ts";
import type { DossierDeSortie } from "../domaine/DossierDeSortie.ts";
import type { CliCodexSecurity } from "../ports/CliCodexSecurity.ts";
import { type DependancesExecution, PrepareExecutionCodex } from "./prepareExecutionCodex.ts";
import type {EstimationDuCout} from "../../cout/application/estimationDuCout.ts";
import {type ConsommationDeTokens, unReleveDeConsommationDeTokensCodex} from "../../cout/domaine/consommationDeTokens.ts";

export type Dependances = DependancesExecution & { estimation: EstimationDuCout; console: Console };

export class LanceScan {
  readonly #racine: string;
  readonly #execution: PrepareExecutionCodex;
  readonly #cli: CliCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #estimation: EstimationDuCout;
  readonly #console: Console;

  constructor(dependances: Dependances) {
    this.#racine = dependances.racine;
    this.#execution = new PrepareExecutionCodex(dependances);
    this.#cli = dependances.cli;
    this.#systemeDeFichier = dependances.systemeDeFichier;
    this.#estimation = dependances.estimation;
    this.#console = dependances.console;
  }

  async execute({ options }: { options: string[] }, releveDeTokens : (log: string, fournisseur: string, modele: string) => ConsommationDeTokens | null = unReleveDeConsommationDeTokensCodex): Promise<number> {
    const { cible, config, sortie, environnement } = await this.#execution.pour("scan");
    this.#console.affiche(`Cible  : ${cible}`, 'VIOLET');
    this.#console.affiche(`Config : ${config}`, 'ORANGE');
    this.#console.affiche(`Sortie : ${sortie.chemin}`, 'BLEU');

    const statut = await this.#cli.scanne({
      cible,
      config,
      sortie: sortie.chemin,
      journal: sortie.journal,
      options: this.#optionsDuScan(options),
      environnement,
    });
    this.#estimeLeCout(config, sortie, releveDeTokens);
    return statut;
  }

  #optionsDuScan(options: string[]): string[] {
    const consignes = join(this.#racine, "outils/codex-security/configs/consignes-scan.md");
    const fournie = (option: string) => options.some((o) => o === option || o.startsWith(`${option}=`));
    return [
      ...(fournie("--scan-prompt-file") ? [] : ["--scan-prompt-file", consignes]),
      ...(fournie("--verbose") ? [] : ["--verbose"]),
      ...options,
    ];
  }

  #estimeLeCout(config: string, sortie: DossierDeSortie, releveDeTokens: (log: string, fournisseur: string, modele: string) => (ConsommationDeTokens | null)): void {
    try {
      const { modele, fournisseur } = ConfigScan.depuisYaml(this.#systemeDeFichier.lit(config));
      const consommation = releveDeTokens(this.#systemeDeFichier.lit(sortie.journal), fournisseur, modele);
      this.#estimation.rapporte(consommation)
    } catch (erreur) {
      this.#console.signaleErreur(`Estimation du coût impossible : ${erreur instanceof Error ? erreur.message : erreur}`);
    }
  }
}
