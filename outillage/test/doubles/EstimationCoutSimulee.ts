import type { EstimationCout } from "../../src/codex-security/application/LanceScan.ts";

type Demande = { log: string; fournisseur: string; modele: string };

export class EstimationCoutSimulee implements EstimationCout {
  readonly demandes: Demande[] = [];
  readonly #echec?: Error;

  constructor({ echec }: { echec?: Error } = {}) {
    this.#echec = echec;
  }

  surLogCodex(demande: Demande): void {
    if (this.#echec) throw this.#echec;
    this.demandes.push(demande);
  }
}
