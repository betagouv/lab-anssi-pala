import { resolve } from 'node:path';
import type { Environnement } from '../../ports/Environnement.ts';

// Variables du processus. Les variables désignant des chemins peuvent être résolues depuis un
// répertoire (celui d'où l'utilisateur a lancé la commande), pnpm exécutant depuis la racine.
export class EnvironnementProcessus implements Environnement {
  readonly #chemins: string[];
  readonly #depuis: string;

  constructor({
    chemins = [],
    depuis = process.cwd(),
  }: { chemins?: string[]; depuis?: string } = {}) {
    this.#chemins = chemins;
    this.#depuis = depuis;
  }

  variables(): Record<string, string | undefined> {
    const variables: Record<string, string | undefined> = { ...process.env };
    for (const nom of this.#chemins) {
      if (variables[nom]) variables[nom] = resolve(this.#depuis, variables[nom]);
    }
    return variables;
  }
}
