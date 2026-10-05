import type { DepotShannon } from '../../src/shannon/ports/DepotShannon.ts';

export class DepotShannonSimule implements DepotShannon {
  readonly #patchs: string[];
  readonly #dejaAppliques: Set<string>;
  readonly patchsAppliques: string[] = [];

  constructor({
    patchs = [],
    dejaAppliques = [],
  }: { patchs?: string[]; dejaAppliques?: string[] } = {}) {
    this.#patchs = patchs;
    this.#dejaAppliques = new Set(dejaAppliques);
  }

  patchsLocaux(): string[] {
    return this.#patchs;
  }

  async patchApplicable(patch: string): Promise<boolean> {
    return !this.#dejaAppliques.has(patch);
  }

  async appliquePatch(patch: string): Promise<void> {
    this.patchsAppliques.push(patch);
    this.#dejaAppliques.add(patch);
  }
}
