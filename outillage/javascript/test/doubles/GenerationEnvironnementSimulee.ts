import type { GenerationEnvironnement } from '../../src/codex-security/application/demarreProxy.ts';

export class GenerationEnvironnementSimulee implements GenerationEnvironnement {
  readonly #journal: string[];

  constructor(journal: string[] = []) {
    this.#journal = journal;
  }

  execute(): void {
    this.#journal.push('environnement généré');
  }
}
