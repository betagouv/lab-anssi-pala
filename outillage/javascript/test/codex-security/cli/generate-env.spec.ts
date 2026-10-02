import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../../doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../doubles/EnvironnementEnMemoire.ts";
import { GenerateurDeJetonFige } from "../../doubles/GenerateurDeJetonFige.ts";
import { SystemeDeFichierEnMemoire } from "../../doubles/SystemeDeFichierEnMemoire.ts";
import { genereEnv } from "../../../src/codex-security/cli/generate-env.ts";

describe("generate-env (ligne de commande)", () => {
  test("signale l'erreur et sort en code 1 quand la génération échoue", async () => {
    const console = new ConsoleEnMemoire();

    const code = await genereEnv([], {
      systemeDeFichier: new SystemeDeFichierEnMemoire(),
      generateurDeJeton: new GenerateurDeJetonFige("sk-local-neuf"),
      environnement: new EnvironnementEnMemoire(),
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs.map(l => l.message)).toEqual(["Erreur: fichier .env introuvable à la racine du dépôt (depuis .env.template)"]);
  });
});
