import type { Environnement } from "../../src/noyau/ports/Environnement.ts";

export class EnvironnementEnMemoire implements Environnement {
  readonly #variables: Record<string, string | undefined>;

  constructor(variables: Record<string, string | undefined> = {}) {
    this.#variables = variables;
  }

  variables(): Record<string, string | undefined> {
    return { ...this.#variables };
  }
}
