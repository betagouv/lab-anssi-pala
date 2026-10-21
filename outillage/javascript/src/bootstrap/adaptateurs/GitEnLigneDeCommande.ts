import { executeCommande } from '../../noyau/adaptateurs/node/processus.ts';
import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';
import type { Git, Modifications } from '../ports/Git.ts';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

export class GitEnLigneDeCommande implements Git {
  readonly #racine: string;

  constructor(racine: string) {
    this.#racine = racine;
  }

  initialiseSousModules(): Promise<void> {
    return executeCommande('git', ['submodule', 'update', '--init', '--recursive'], {
      cwd: this.#racine,
    });
  }

  cloneCible(cible: CibleBootstrap): Promise<void> {
    const branche = cible.branche ? ['--branch', cible.branche] : [];
    return executeCommande(
      'git',
      ['clone', ...branche, cible.url, cible.copieDeTravail],
      { cwd: this.#racine }
    );
  }

  metAJour(repertoireDepot: string): void {
    execFileSync('git', ['pull', '--ff-only'], {
      cwd: resolve(this.#racine, repertoireDepot),
      encoding: 'utf8',
    });
  }

  fichiersModifiesDepuis(
    repertoireDepot: string,
    nombreDeJours: number
  ): Modifications {
    const sortie = execFileSync(
      'git',
      [
        '-c',
        'core.quotePath=false',
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
    return { liste: [...new Set(fichiers)].sort() };
  }
}
