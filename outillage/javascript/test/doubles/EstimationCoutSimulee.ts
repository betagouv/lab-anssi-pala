import type { EstimationCout } from "../../src/codex-security/application/lanceScan.ts";
import type { EstimationCoutShannon } from "../../src/shannon/application/lancePentest.ts";

type DemandeCodex = { log: string; fournisseur: string; modele: string };
type DemandeShannon = { session: string; specModele: string };

export class EstimationCoutSimulee implements EstimationCout, EstimationCoutShannon {
  readonly demandes: (DemandeCodex | DemandeShannon)[] = [];
  readonly #echec?: Error;

  constructor({ echec }: { echec?: Error } = {}) {
    this.#echec = echec;
  }

  surLogCodex(demande: DemandeCodex): void {
    if (this.#echec) throw this.#echec;
    this.demandes.push(demande);
  }

  surSessionShannon(demande: DemandeShannon): void {
    if (this.#echec) throw this.#echec;
    this.demandes.push(demande);
  }
}
