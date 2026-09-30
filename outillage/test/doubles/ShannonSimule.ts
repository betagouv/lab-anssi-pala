import type { DemandeDeLancement, Shannon } from "../../src/shannon/ports/Shannon.ts";

// apresLeRun simule les effets du pentest (ex. la session écrite dans le workspace).
export class ShannonSimule implements Shannon {
  readonly lancements: DemandeDeLancement[] = [];
  readonly #statut: number;
  readonly #apresLeRun: () => void;
  readonly #echec?: Error;

  constructor({
    statut = 0,
    apresLeRun = () => {},
    echec,
  }: { statut?: number; apresLeRun?: () => void; echec?: Error } = {}) {
    this.#statut = statut;
    this.#apresLeRun = apresLeRun;
    this.#echec = echec;
  }

  async demarre(demande: DemandeDeLancement): Promise<number> {
    this.lancements.push(demande);
    if (this.#echec) throw this.#echec;
    this.#apresLeRun();
    return this.#statut;
  }
}
