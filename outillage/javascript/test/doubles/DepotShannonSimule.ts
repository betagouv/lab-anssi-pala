import type { DepotShannon } from '../../src/shannon/ports/DepotShannon.ts';

export class DepotShannonSimule implements DepotShannon {
  readonly #patchs: string[];
  readonly #dejaAppliques: Set<string>;
  readonly patchsAppliques: string[] = [];
  #cliConstruite: boolean;
  construiteAppelee = false;

  constructor({
    patchs = [],
    dejaAppliques = [],
    cliConstruite = true,
  }: {
    patchs?: string[];
    dejaAppliques?: string[];
    cliConstruite?: boolean;
  } = {}) {
    this.#patchs = patchs;
    this.#dejaAppliques = new Set(dejaAppliques);
    this.#cliConstruite = cliConstruite;
  }

  cliEstConstruite(): boolean {
    return this.#cliConstruite;
  }

  async construitCli(): Promise<void> {
    this.construiteAppelee = true;
    this.#cliConstruite = true;
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
