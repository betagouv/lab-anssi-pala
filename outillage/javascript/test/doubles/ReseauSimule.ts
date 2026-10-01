import type { Reseau } from "../../src/noyau/ports/Reseau.ts";

// Répond selon une suite scriptée de réponses, puis en répétant la dernière (par défaut : répond).
export class ReseauSimule implements Reseau {
  readonly #reponses: boolean[];
  readonly urlsInterrogees: string[] = [];

  constructor(reponses: boolean[] = [true]) {
    this.#reponses = [...reponses];
  }

  async repond(url: string): Promise<boolean> {
    this.urlsInterrogees.push(url);
    return this.#reponses.length > 1 ? this.#reponses.shift()! : this.#reponses[0];
  }
}
