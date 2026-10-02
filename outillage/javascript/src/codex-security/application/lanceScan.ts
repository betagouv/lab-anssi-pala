// Lance un scan Codex Security sur la copie de travail d'une cible, via le proxy LiteLLM local, puis
// en estime le coût. Portage TS de run-scan.sh.
import { join } from "node:path";
import type { Console } from "../../noyau/ports/Console.ts";
import type { SystemeDeFichier } from "../../noyau/ports/SystemeDeFichier.ts";
import { ConfigScan } from "../domaine/ConfigScan.ts";
import type { DossierDeSortie } from "../domaine/DossierDeSortie.ts";
import type { CliCodexSecurity } from "../ports/CliCodexSecurity.ts";
import { type DependancesExecution, PrepareExecutionCodex } from "./prepareExecutionCodex.ts";

// Estimation du coût d'un scan à partir de son log (voir EstimeCout).
export interface EstimationCout {
  surLogCodex(demande: { log: string; fournisseur: string; modele: string }): void;
}

export type Dependances = DependancesExecution & { estimation: EstimationCout; console: Console };

export class LanceScan {
  readonly #racine: string;
  readonly #execution: PrepareExecutionCodex;
  readonly #cli: CliCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #estimation: EstimationCout;
  readonly #console: Console;

  constructor(dependances: Dependances) {
    this.#racine = dependances.racine;
    this.#execution = new PrepareExecutionCodex(dependances);
    this.#cli = dependances.cli;
    this.#systemeDeFichier = dependances.systemeDeFichier;
    this.#estimation = dependances.estimation;
    this.#console = dependances.console;
  }

  async execute({ options }: { options: string[] }): Promise<number> {
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
    this.#estimeLeCout(config, sortie);
    return statut;
  }

  // Options ajoutées par défaut, chacune sauf si l'utilisateur la fournit déjà :
  // - les consignes du dépôt : sans elles, DeepSeek ne parvient pas à écrire findings.json
  //   (voir configs/consignes-scan.md et le README) ;
  // - --verbose : seul le log bavard porte le relevé TOKENS qui permet d'estimer le coût.
  #optionsDuScan(options: string[]): string[] {
    const consignes = join(this.#racine, "outils/codex-security/configs/consignes-scan.md");
    const fournie = (option: string) => options.some((o) => o === option || o.startsWith(`${option}=`));
    return [
      ...(fournie("--scan-prompt-file") ? [] : ["--scan-prompt-file", consignes]),
      ...(fournie("--verbose") ? [] : ["--verbose"]),
      ...options,
    ];
  }

  // Best-effort : n'affecte jamais le statut du scan.
  #estimeLeCout(config: string, sortie: DossierDeSortie): void {
    try {
      const { modele, fournisseur } = ConfigScan.depuisYaml(this.#systemeDeFichier.lit(config));
      this.#estimation.surLogCodex({ log: sortie.journal, fournisseur, modele });
    } catch (erreur) {
      this.#console.signaleErreur(`Estimation du coût impossible : ${erreur instanceof Error ? erreur.message : erreur}`);
    }
  }
}
