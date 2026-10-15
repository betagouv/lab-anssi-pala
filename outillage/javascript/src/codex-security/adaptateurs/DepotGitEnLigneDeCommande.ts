import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { DepotGit } from '../ports/DepotGit.ts';

// Équivalent de : git log --since="<N> days ago" --name-only --pretty=format: | sort -u
// exécuté dans le dépôt `repertoireDepot` (résolu depuis `racine`), chemins relatifs à ce dépôt.
export class DepotGitEnLigneDeCommande implements DepotGit {
  readonly #racine: string;

  constructor(racine: string) {
    this.#racine = racine;
  }

  fichiersModifiesDepuis(repertoireDepot: string, nombreDeJours: number): string[] {
    const sortie = execFileSync(
      'git',
      [
        'log',
        `--since=${nombreDeJours} days ago`,
        '--name-only',
        '--pretty=format:',
      ],
      { cwd: resolve(this.#racine, repertoireDepot), encoding: 'utf8' }
    );
    const fichiers = sortie
      .split('\n')
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne.length > 0);
    return [...new Set(fichiers)].sort();
  }
}
