export class Perimetre {
  readonly #chemins: readonly string[] | undefined;

  private constructor(chemins: readonly string[] | undefined) {
    this.#chemins = chemins;
  }

  static deChemins(chemins: readonly string[]): Perimetre {
    return new Perimetre(chemins);
  }

  static nonContraignant(): Perimetre {
    return new Perimetre(undefined);
  }

  estVide(): boolean {
    return this.#chemins !== undefined && this.#chemins.length === 0;
  }
}
