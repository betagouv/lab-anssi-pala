import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../../test/doubles/ConsoleEnMemoire.ts";
import { GitSimule } from "../../test/doubles/GitSimule.ts";
import { SystemeDeFichierEnMemoire } from "../../test/doubles/SystemeDeFichierEnMemoire.ts";
import type { Dependances } from "./application/PrepareEnvironnement.ts";
import { bootstrap } from "./cli.ts";

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
    expect(console.erreurs[0]).toBe("Erreur : --project fourni sans --url.");
    expect(git.sousModulesInitialises).toBe(false);
  });

  test("refuse --url sans --project (erreur d'usage, code 2)", async () => {
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(["--url", "https://git.example/app.git"], dependances({ console }));

    expect(code).toBe(2);
    expect(console.erreurs[0]).toBe("Erreur : --url fourni sans --project.");
  });

  test("affiche l'aide, avec des exemples, sans rien préparer", async () => {
    const git = new GitSimule();
    const console = new ConsoleEnMemoire();

    const code = await bootstrap(["--help"], dependances({ git, console }));

    expect(code).toBe(0);
    expect(git.sousModulesInitialises).toBe(false);
    expect(console.lignes).toEqual(
      expect.arrayContaining([
        "  pnpm bootstrap --project cible-exemple --url https://github.com/betagouv/cible-exemple.git",
      ]),
    );
  });
});
