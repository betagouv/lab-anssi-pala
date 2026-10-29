import type { Console } from '../../noyau/ports/Console.ts';
import type { CibleScan } from '../domaine/cibles.ts';

export interface EtapesScanComplet {
  bootstrap(cible: CibleScan): void | Promise<void>;
  genereEnv(): void | Promise<void>;
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
    proxyLocal,
  }: {
    cibles: CibleScan[];
    jours?: number;
    proxyLocal: boolean;
  }): Promise<number> {
    await this.#etapes.genereEnv();
    if (proxyLocal) {
      await this.#etapes.demarreProxy();
    } else {
      this.#console.aLaLigne(
        'Proxy distant configuré — démarrage du conteneur local ignoré.',
        'ORANGE'
      );
    }

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
