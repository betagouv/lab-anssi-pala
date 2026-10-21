import { describe, expect, it } from 'vitest';
import { ConsoleEnMemoire } from '../doubles/ConsoleEnMemoire.ts';
import { GitMemoire } from '../doubles/GitMemoire.ts';
import { SystemeDeFichierEnMemoire } from '../doubles/SystemeDeFichierEnMemoire.ts';
import type { Dependances } from '../../src/bootstrap/application/prepareEnvironnement.ts';
import { bootstrap } from '../../src/bootstrap/cli.ts';

const lesDependancesDuBootstrap = (
  doubles: Partial<Dependances> = {}
): Dependances => ({
  git: new GitMemoire(),
  systemeDeFichier: new SystemeDeFichierEnMemoire(),
  console: new ConsoleEnMemoire(),
  outils: [],
  ...doubles,
});

describe('bootstrap (ligne de commande)', () => {
  it("prépare l'environnement avec la cible désignée par --project, --url et --branch", async () => {
    const git = new GitMemoire();

    const code = await bootstrap(
      [
        '--project',
        'app',
        '--url',
        'https://git.example/app.git',
        '--branch',
        'main',
      ],
      lesDependancesDuBootstrap({ git })
    );

    expect(code).toBe(0);
    expect(git.clonages).toEqual([
      {
        url: 'https://git.example/app.git',
        branche: 'main',
        copie: 'cible/copies/app',
      },
    ]);
  });

  it("refuse --project sans --url, sans rien préparer (erreur d'usage, code 2)", async () => {
    const git = new GitMemoire();
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(
      ['--project', 'app'],
      lesDependancesDuBootstrap({ git, console })
    );

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      'Erreur : --project fourni sans --url.'
    );
    expect(git.sousModulesInitialises).toBe(false);
  });

  it("refuse --url sans --project (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(
      ['--url', 'https://git.example/app.git'],
      lesDependancesDuBootstrap({ console })
    );

    expect(code).toBe(2);
    expect(console.erreurs.map((l) => l.message)[0]).toBe(
      'Erreur : --url fourni sans --project.'
    );
  });

  it("affiche l'aide, avec des exemples, sans rien préparer", async () => {
    const git = new GitMemoire();
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(
      ['--help'],
      lesDependancesDuBootstrap({ git, console })
    );

    expect(code).toBe(0);
    expect(git.sousModulesInitialises).toBe(false);
    expect(console.lignes.map((l) => l.message)).toEqual(
      expect.arrayContaining([
        '  pnpm bootstrap --project cible-exemple --url https://github.com/betagouv/cible-exemple.git',
      ])
    );
  });
});
