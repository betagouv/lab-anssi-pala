import type { Reseau } from '../ports/Reseau.ts';

// Équivalent de `curl -s -o /dev/null -m <délai>` : répond si la connexion aboutit dans le délai.
export class ReseauFetch implements Reseau {
  readonly #delaiMs: number;

  constructor(delaiMs = 5000) {
    this.#delaiMs = delaiMs;
  }

  async repond(url: string): Promise<boolean> {
    try {
      await fetch(url, { signal: AbortSignal.timeout(this.#delaiMs) });
      return true;
    } catch {
      return false;
    }
  }
}
