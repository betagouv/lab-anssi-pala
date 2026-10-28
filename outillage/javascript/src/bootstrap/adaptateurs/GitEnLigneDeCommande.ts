import { executeCommande } from '../../noyau/adaptateurs/node/processus.ts';
import type { CibleBootstrap } from '../domaine/CibleBootstrap.ts';
import type { Git, HashDeCommit, Modifications } from '../ports/Git.ts';
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
    const listeDeFichiers = execFileSync(
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

    const hashsDeCommit = execFileSync(
      'git',
      ['log', `--since=${nombreDeJours} days ago`, '--reverse', '--format="%H"'],
      { cwd: resolve(this.#racine, repertoireDepot), encoding: 'utf8' }
    );
    const {
      length,
      0: premierCommit,
      [length - 1]: dernierCommit,
    } = hashsDeCommit.split('\n').filter((l) => l.length > 0);

    const fichiers = listeDeFichiers
      .split('\n')
      .map((ligne) => ligne.trim())
      .filter((ligne) => ligne.length > 0);
    return {
      ...(premierCommit && { premierCommit: this.hashDeCommit(premierCommit) }),
      ...(dernierCommit && { dernierCommit: this.hashDeCommit(dernierCommit) }),
      liste: [...new Set(fichiers)].sort(),
    };
  }

  private hashDeCommit(hashDeCommit: string): HashDeCommit {
    return { court: hashDeCommit.substring(1, 9), long: hashDeCommit };
  }
}
