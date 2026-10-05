import type { GenerateurDeJeton } from '../../src/codex-security/ports/GenerateurDeJeton.ts';

export class GenerateurDeJetonFige implements GenerateurDeJeton {
  readonly #jeton: string;

  constructor(jeton: string) {
    this.#jeton = jeton;
  }

  jetonLocal(): string {
    return this.#jeton;
  }
}
