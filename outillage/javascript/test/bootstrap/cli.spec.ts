import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../doubles/ConsoleEnMemoire.ts";
import { GitSimule } from "../doubles/GitSimule.ts";
import { SystemeDeFichierEnMemoire } from "../doubles/SystemeDeFichierEnMemoire.ts";
import type { Dependances } from "../../src/bootstrap/application/prepareEnvironnement.ts";
import { bootstrap } from "../../src/bootstrap/cli.ts";

function dependances(doubles: Partial<Dependances> = {}): Dependances {
  return {
    git: new GitSimule(),
    systemeDeFichier: new SystemeDeFichierEnMemoire(),
    console: new ConsoleEnMemoire(),
    outils: [],
    ...doubles,
  };
}

describe("bootstrap (ligne de commande)", () => {
  test("prépare l'environnement avec la cible désignée par --project, --url et --branch", async () => {
    const git = new GitSimule();

    const code = await bootstrap(
      ["--project", "app", "--url", "https://git.example/app.git", "--branch", "main"],
      dependances({ git }),
    );

    expect(code).toBe(0);
    expect(git.clonages).toEqual([{ url: "https://git.example/app.git", branche: "main", copie: "cible/copies/app" }]);
  });

  test("refuse --project sans --url, sans rien préparer (erreur d'usage, code 2)", async () => {
    const git = new GitSimule();
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(["--project", "app"], dependances({ git, console }));

    expect(code).toBe(2);
    expect(console.erreurs.map(l => l.message)[0]).toBe("Erreur : --project fourni sans --url.");
    expect(git.sousModulesInitialises).toBe(false);
  });

  test("refuse --url sans --project (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(["--url", "https://git.example/app.git"], dependances({ console }));

    expect(code).toBe(2);
    expect(console.erreurs.map(l => l.message)[0]).toBe("Erreur : --url fourni sans --project.");
  });

  test("affiche l'aide, avec des exemples, sans rien préparer", async () => {
    const git = new GitSimule();
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(["--help"], dependances({ git, console }));

    expect(code).toBe(0);
    expect(git.sousModulesInitialises).toBe(false);
    expect(console.lignes.map(l => l.message)).toEqual(
      expect.arrayContaining([
        "  pnpm bootstrap --project cible-exemple --url https://github.com/betagouv/cible-exemple.git",
      ]),
    );
  });
});
