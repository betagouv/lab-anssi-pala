import type { Console } from '../../noyau/ports/Console.ts';
import type { CibleScan } from '../domaine/cibles.ts';

export interface EtapesScanComplet {
  bootstrap(cible: CibleScan): void | Promise<void>;
  genereEnv(): void | Promise<void>;
  genereConfigProxy(): void | Promise<void>;
  genereConfig(nomCible: string, jours?: number): void | Promise<void>;
  demarreProxy(): void | Promise<void>;
  scan(nomCible: string): Promise<number>;
}

export type Dependances = {
  etapes: EtapesScanComplet;
  console: Console;
};

export class LanceScanComplet {
  readonly #etapes: EtapesScanComplet;
  readonly #console: Console;

  constructor({ etapes, console }: Dependances) {
    this.#etapes = etapes;
    this.#console = console;
  }

  async execute({
    cibles,
    jours,
  }: {
    cibles: CibleScan[];
    jours?: number;
  }): Promise<number> {
    await this.#etapes.genereEnv();
    await this.#etapes.genereConfigProxy();
    await this.#etapes.demarreProxy();

    return await this.#scanToutesLesCibles(cibles, jours);
  }

  async #scanToutesLesCibles(cibles: CibleScan[], jours?: number) {
    let echecs = 0;
    for (const cible of cibles) {
      try {
        await this.#etapes.bootstrap(cible);
        await this.#etapes.genereConfig(cible.nom, jours);
        const resultatScan = await this.#etapes.scan(cible.nom);
        echecs += resultatScan === 0 ? 0 : 1;
      } catch (erreur) {
        this.#console.signaleErreur(
          `Échec de la cible « ${cible.nom} » : ${erreur instanceof Error ? erreur.message : erreur}`
        );
        echecs++;
      }
    }
    return echecs;
  }
}
