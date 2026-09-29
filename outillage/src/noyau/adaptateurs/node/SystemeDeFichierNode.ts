import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SystemeDeFichier } from "../../ports/SystemeDeFichier.ts";

// Les chemins relatifs s'entendent depuis le répertoire de base : sous pnpm, le répertoire d'où
// l'utilisateur a lancé la commande (INIT_CWD), pnpm exécutant les scripts depuis la racine.
export class SystemeDeFichierNode implements SystemeDeFichier {
  readonly #base: string;

  constructor(base = process.env.INIT_CWD || process.cwd()) {
    this.#base = base;
  }

  lit(chemin: string): string {
    try {
      return readFileSync(resolve(this.#base, chemin), "utf8");
    } catch (erreur) {
      if ((erreur as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`Fichier introuvable : ${chemin}`);
      throw erreur;
    }
  }
}
