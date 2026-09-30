import type { DemandeDeLancement, Shannon } from "../../src/shannon/ports/Shannon.ts";

// apresLeRun simule les effets du pentest (ex. la session écrite dans le workspace).
export class ShannonSimule implements Shannon {
  readonly lancements: DemandeDeLancement[] = [];
  readonly #statut: number;
  readonly #apresLeRun: () => void;

  constructor({ statut = 0, apresLeRun = () => {} }: { statut?: number; apresLeRun?: () => void } = {}) {
    this.#statut = statut;
    this.#apresLeRun = apresLeRun;
  }

  async demarre(demande: DemandeDeLancement): Promise<number> {
    this.lancements.push(demande);
    this.#apresLeRun();
    return this.#statut;
  }
}
