import type { Console } from '../../noyau/ports/Console.ts';

export type CibleCinematique = { nom: string; url: string; branche?: string };

// Les étapes de la cinématique, dans l'ordre. Chacune délègue à l'application correspondante :
// un échec se propage par exception ; seul le scan renvoie un code (statut Codex Security).
export interface EtapesScanComplet {
  bootstrap(cible: CibleCinematique): void | Promise<void>;
  genereEnv(): void | Promise<void>;
  genereConfig(nomCible: string, jours?: number): void | Promise<void>;
  demarreProxy(): void | Promise<void>;
  scan(nomCible: string): Promise<number>;
}

export type Dependances = {
  etapes: EtapesScanComplet;
  console: Console;
};

export class LanceCinematique {
  readonly #etapes: EtapesScanComplet;
  readonly #console: Console;

  constructor({ etapes, console }: Dependances) {
    this.#etapes = etapes;
    this.#console = console;
  }

  async execute({
    cible,
    jours,
    proxyLocal,
  }: {
    cible: CibleCinematique;
    jours?: number;
    proxyLocal: boolean;
  }): Promise<number> {
    await this.#etapes.bootstrap(cible);
    await this.#etapes.genereEnv();
    await this.#etapes.genereConfig(cible.nom, jours);
    if (proxyLocal) {
      await this.#etapes.demarreProxy();
    } else {
      this.#console.aLaLigne(
        'Proxy distant configuré — démarrage du conteneur local ignoré.',
        'ORANGE'
      );
    }
    return this.#etapes.scan(cible.nom);
  }
}
