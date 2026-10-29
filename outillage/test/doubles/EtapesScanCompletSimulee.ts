import type { EtapesScanComplet } from '../../src/scan-complet/application/lanceScanComplet.ts';
import type { CibleScan } from '../../src/scan-complet/domaine/cibles.ts';

type Etape = 'bootstrap' | 'genereEnv' | 'genereConfig' | 'demarreProxy' | 'scan';

export class EtapesScanCompletSimulee implements EtapesScanComplet {
  readonly journal: Etape[] = [];
  readonly ciblesBootstrapees: CibleScan[] = [];
  readonly configsDemandees: { nomCible: string; jours?: number }[] = [];
  readonly ciblesScannees: string[] = [];
  readonly #codesScan: Record<string, number>;
  readonly #leveSur?: { etape: Etape; cible: string };

  constructor({
    codesScan = {},
    leveSur,
  }: {
    codesScan?: Record<string, number>;
    leveSur?: { etape: Etape; cible: string };
  } = {}) {
    this.#codesScan = codesScan;
    this.#leveSur = leveSur;
  }

  bootstrap(cible: CibleScan): void {
    this.#enregistre('bootstrap', cible.nom);
    this.ciblesBootstrapees.push(cible);
  }

  genereEnv(): void {
    this.#enregistre('genereEnv');
  }

  genereConfig(nomCible: string, jours?: number): void {
    this.#enregistre('genereConfig', nomCible);
    this.configsDemandees.push({ nomCible, jours });
  }

  demarreProxy(): void {
    this.#enregistre('demarreProxy');
  }

  async scan(nomCible: string): Promise<number> {
    this.#enregistre('scan', nomCible);
    this.ciblesScannees.push(nomCible);
    return this.#codesScan[nomCible] ?? 0;
  }

  #enregistre(etape: Etape, cible?: string): void {
    this.journal.push(etape);
    if (this.#leveSur?.etape === etape && this.#leveSur.cible === cible)
      throw new Error(`échec simulé : ${etape} (${cible})`);
  }
}
