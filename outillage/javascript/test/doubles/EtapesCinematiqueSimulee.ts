import type {
  CibleCinematique,
  EtapesScanComplet,
} from '../../src/cinematique/application/lanceCinematique.ts';

type Etape = 'bootstrap' | 'genereEnv' | 'genereConfig' | 'demarreProxy' | 'scan';

// Enregistre l'ordre d'appel des étapes et les paramètres reçus.
// `echoue` fait lever l'étape nommée (comme une application en erreur) ;
// `codeScan` est le statut renvoyé par le scan.
export class EtapesCinematiqueSimulee implements EtapesScanComplet {
  readonly journal: Etape[] = [];
  cibleBootstrap?: CibleCinematique;
  configDemandee?: { nomCible: string; jours?: number };
  cibleScannee?: string;
  readonly #echoue?: Etape;
  readonly #codeScan: number;

  constructor({ echoue, codeScan = 0 }: { echoue?: Etape; codeScan?: number } = {}) {
    this.#echoue = echoue;
    this.#codeScan = codeScan;
  }

  bootstrap(cible: CibleCinematique): void {
    this.#enregistre('bootstrap');
    this.cibleBootstrap = cible;
  }

  genereEnv(): void {
    this.#enregistre('genereEnv');
  }

  genereConfig(nomCible: string, jours?: number): void {
    this.#enregistre('genereConfig');
    this.configDemandee = { nomCible, jours };
  }

  demarreProxy(): void {
    this.#enregistre('demarreProxy');
  }

  async scan(nomCible: string): Promise<number> {
    this.#enregistre('scan');
    this.cibleScannee = nomCible;
    return this.#codeScan;
  }

  #enregistre(etape: Etape): void {
    this.journal.push(etape);
    if (this.#echoue === etape) throw new Error(`échec simulé : ${etape}`);
  }
}
