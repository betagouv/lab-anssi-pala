// Description pi d'un fournisseur de modèles (outils/shannon/configs/models.<fournisseur>.json),
// lue par Shannon ; elle porte notamment l'URL de l'API compatible Chat Completions.
export class DescriptionPi {
  readonly #fournisseurs: Record<string, { baseUrl?: string }>;

  private constructor(fournisseurs: Record<string, { baseUrl?: string }>) {
    this.#fournisseurs = fournisseurs;
  }

  static depuisJson(json: string): DescriptionPi {
    return new DescriptionPi(JSON.parse(json).providers ?? {});
  }

  urlDe(fournisseur: string): string | undefined {
    return this.#fournisseurs[fournisseur]?.baseUrl;
  }
}
