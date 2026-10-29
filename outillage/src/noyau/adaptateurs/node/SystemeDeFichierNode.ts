import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import type { SystemeDeFichier } from '../../ports/SystemeDeFichier.ts';

export class SystemeDeFichierNode implements SystemeDeFichier {
  readonly #base: string;

  constructor(base = process.env.INIT_CWD || process.cwd()) {
    this.#base = base;
  }

  lit(chemin: string): string {
    try {
      return readFileSync(resolve(this.#base, chemin), 'utf8');
    } catch (erreur) {
      if ((erreur as NodeJS.ErrnoException).code === 'ENOENT')
        throw new Error(`Fichier introuvable : ${chemin}`, { cause: erreur });
      throw erreur;
    }
  }

  existe(chemin: string): boolean {
    return existsSync(resolve(this.#base, chemin));
  }

  creeDossier(chemin: string): void {
    mkdirSync(resolve(this.#base, chemin), { recursive: true });
  }

  creeDossierPrive(chemin: string): void {
    const absolu = resolve(this.#base, chemin);
    mkdirSync(absolu, { recursive: true });
    chmodSync(absolu, 0o700);
  }

  ecritFichier(chemin: string, contenu: string): void {
    writeFileSync(resolve(this.#base, chemin), contenu);
  }

  ecritFichierPrive(chemin: string, contenu: string): void {
    const absolu = resolve(this.#base, chemin);
    writeFileSync(absolu, contenu, { mode: 0o600 });
    chmodSync(absolu, 0o600);
  }
}
