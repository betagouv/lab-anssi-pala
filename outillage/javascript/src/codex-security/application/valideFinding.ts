import { join } from 'node:path';
import type { Console } from '../../noyau/ports/Console.ts';
import type { Horloge } from '../../noyau/ports/Horloge.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';
import type {
  DemandeDeValidation,
  ResultatDeValidation,
  ValidationCodex,
} from '../ports/ValidationCodex.ts';
import {
  type DependancesExecution,
  PrepareExecutionCodex,
} from './prepareExecutionCodex.ts';

export type Dependances = DependancesExecution & {
  validation: ValidationCodex;
  console: Console;
};

type CommandeDeValidation = { findingFile: string; cible: string };

export class ValideFinding {
  readonly #execution: PrepareExecutionCodex;
  readonly #validation: ValidationCodex;
  readonly #systemeDeFichier: SystemeDeFichier;
  readonly #horloge: Horloge;
  readonly #console: Console;

  constructor(dependances: Dependances) {
    this.#execution = new PrepareExecutionCodex(dependances);
    this.#validation = dependances.validation;
    this.#systemeDeFichier = dependances.systemeDeFichier;
    this.#horloge = dependances.horloge;
    this.#console = dependances.console;
  }

  async execute({ findingFile, cible }: CommandeDeValidation): Promise<void> {
    const { config, sortie, environnementCodex } = await this.#execution.pour(
      'validate',
      cible
    );
    this.#console.aLaLigne(`Cible  : ${cible}`, 'VIOLET');
    this.#console.aLaLigne(`Config : ${config}`, 'ORANGE');
    this.#console.aLaLigne(`Sortie : ${sortie.chemin}`, 'BLEU');

    const finding = this.#litFinding(findingFile);
    const { resultat, dureeSecondes } = await this.#valideEnMesurant({
      cible,
      config,
      finding,
      sortie: sortie.chemin,
      environnement: environnementCodex,
    });
    this.#consigne(sortie.chemin, finding, resultat, dureeSecondes);
  }

  async #valideEnMesurant(demande: DemandeDeValidation) {
    const debut = this.#horloge.maintenant().getTime();
    try {
      const resultat = await this.#validation.valide(demande);
      return {
        resultat,
        dureeSecondes: Math.round(
          (this.#horloge.maintenant().getTime() - debut) / 1000
        ),
      };
    } finally {
      await this.#validation.ferme();
    }
  }

  #consigne(
    sortie: string,
    finding: object,
    resultat: ResultatDeValidation,
    dureeSecondes: number
  ): void {
    const synthese = {
      disposition: resultat.disposition,
      outputDir: resultat.dossier,
      durationSeconds: dureeSecondes,
    };
    const resume = {
      disposition: resultat.disposition,
      threadId: resultat.threadId,
      outputDir: resultat.dossier,
      durationSeconds: dureeSecondes,
      finding,
    };
    this.#systemeDeFichier.ecritFichier(
      join(sortie, 'validation-result.json'),
      `${JSON.stringify(resume, null, 2)}\n`
    );
    this.#systemeDeFichier.ecritFichier(
      join(sortie, 'validation-report.md'),
      resultat.rapport
    );
    this.#console.aLaLigne(JSON.stringify(synthese), 'VERT');
  }

  #litFinding(findingFile: string): object {
    try {
      return JSON.parse(this.#systemeDeFichier.lit(findingFile));
    } catch (erreur) {
      if (erreur instanceof SyntaxError)
        throw new Error(
          `Finding illisible : ${findingFile} n'est pas un JSON valide`
        );
      throw erreur;
    }
  }
}
