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
import { type Cout, calculeCout } from '../../cout/domaine/cout.ts';
import type { BusEvenements } from '../../noyau/ports/BusEvenements.ts';
import { unScanTermine } from '../domaine/scanTermine.ts';
import { unScanNonEffectue } from '../domaine/scanNonEffectue.ts';
import { type Constat, extraitLesConstats } from '../domaine/constat.ts';
import { extraitLaDuree } from '../domaine/dureeDuScan.ts';
import type { InformationsDeCommits } from '../domaine/informationsDeCommits.ts';
import { environnement } from '../../noyau/environnement.ts';

export type Dependances = DependancesExecution & {
  estimation: EstimationDuCout;
  console: Console;
  busDEvenements: BusEvenements;
};

type CommandeScan = {
  options: string[];
  cible: string;
  config: string;
  informationsDeCommits?: InformationsDeCommits;
};

export class LanceScan {
  readonly #racine: string;
  readonly #execution: PrepareExecutionCodex;
  readonly #scanner: ScannerCodexSecurity;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #estimation: EstimationDuCout;
  readonly #console: Console;
  readonly #busDEvenements: BusEvenements;

  constructor(dependances: Dependances) {
    this.#racine = dependances.racine;
    this.#execution = new PrepareExecutionCodex(dependances);
    this.#scanner = dependances.scanner;
    this.#systemeDeFichier = dependances.systemeDeFichier;
    this.#estimation = dependances.estimation;
    this.#console = dependances.console;
    this.#busDEvenements = dependances.busDEvenements;
  }

  async execute(
    { options, cible, config, informationsDeCommits }: CommandeScan,
    releveDeTokens: (
      log: string,
      fournisseur: string,
      modele: string
    ) => ConsommationDeTokens | null = unReleveDeConsommationDeTokensCodex
  ): Promise<number> {
    const configScan = this.#lisLaConfig(config);
    if (configScan.perimetre.estVide()) {
      this.#console.aLaLigne(
        `Aucun fichier à scanner (périmètre vide) : scan non effectué pour ${cible}.`,
        'ORANGE'
      );
      await this.#busDEvenements.publie(unScanNonEffectue({ cible }));
      return 0;
    }

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
    const cout = this.#estimeLeCout(configScan, sortie, releveDeTokens);
    const rapport = this.#lisLeRapport(sortie);
    await this.#busDEvenements.publie(
      unScanTermine({
        cible,
        resultat: statut === 0 ? 'Succès' : 'Échec',
        cout,
        constats: this.#lesConstats(sortie),
        informationsDeCommits,
        nombreDeFichiers: configScan.perimetre.nombreDeChemins(),
        dureeEnMs: this.#laDuree(sortie),
        rapport,
      })
    );
    return statut;
  }

  #lesConstats(sortie: DossierDeSortie): Constat[] {
    const findings = join(sortie.chemin, 'findings.json');
    if (!this.#systemeDeFichier.existe(findings)) return [];
    try {
      return extraitLesConstats(this.#systemeDeFichier.lit(findings));
    } catch (erreur) {
      this.#console.signaleErreur(
        `Lecture des constats impossible : ${erreur instanceof Error ? erreur.message : erreur}`
      );
      return [];
    }
  }

  #lisLeRapport(sortie: DossierDeSortie): string {
    const rapport = join(sortie.chemin, 'report.md');
    return this.#systemeDeFichier.existe(rapport)
      ? this.#systemeDeFichier.lit(rapport)
      : '';
  }

  #laDuree(sortie: DossierDeSortie): number | undefined {
    const manifeste = join(sortie.chemin, 'scan-manifest.json');
    if (!this.#systemeDeFichier.existe(manifeste)) return undefined;
    try {
      return extraitLaDuree(this.#systemeDeFichier.lit(manifeste));
    } catch (erreur) {
      this.#console.signaleErreur(
        `Lecture de la durée du scan impossible : ${erreur instanceof Error ? erreur.message : erreur}`
      );
      return undefined;
    }
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

  #lisLaConfig(config: string): ConfigScan {
    try {
      return ConfigScan.depuisYaml(this.#systemeDeFichier.lit(config));
    } catch {
      return ConfigScan.inconnue();
    }
  }

  #estimeLeCout(
    configScan: ConfigScan,
    sortie: DossierDeSortie,
    releveDeTokens: (
      log: string,
      fournisseur: string,
      modele: string
    ) => ConsommationDeTokens | null
  ): Cout {
    try {
      const consommation = releveDeTokens(
        this.#systemeDeFichier.lit(sortie.journal),
        configScan.fournisseur,
        configScan.modele
      );
      this.#estimation.rapporte(consommation);
      return calculeCout(consommation);
    } catch (erreur) {
      this.#console.signaleErreur(
        `Estimation du coût impossible : ${erreur instanceof Error ? erreur.message : erreur}`
      );
      return { type: 'indisponible' };
    }
  }
}
