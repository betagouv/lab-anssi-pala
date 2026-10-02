import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../../doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../doubles/EnvironnementEnMemoire.ts";
import { HorlogeFigee } from "../../doubles/HorlogeFigee.ts";
import { ServeurCibleFumeeSimule } from "../../doubles/ServeurCibleFumeeSimule.ts";
import { ShannonSimule } from "../../doubles/ShannonSimule.ts";
import { SystemeDeFichierEnMemoire } from "../../doubles/SystemeDeFichierEnMemoire.ts";
import { type Dependances, LancePassageDeFumee } from "../../../src/shannon/application/lancePassageDeFumee.ts";

// shannon.env renseigné (modèle servi par Albert) et CLI Shannon construite.
function unDepotPret() {
  return new SystemeDeFichierEnMemoire({
    "outils/shannon/shannon.env": "SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\nSHANNON_AI_API_KEY=cle\n",
    "outils/shannon/source/apps/cli/dist/index.mjs": "",
  });
}

function unPassage(doubles: Partial<Dependances> = {}) {
  return new LancePassageDeFumee({
    racine: "/depot",
    shannon: new ShannonSimule(),
    serveur: new ServeurCibleFumeeSimule(),
    systemeDeFichier: unDepotPret(),
    horloge: new HorlogeFigee(new Date(1_790_000_000_000)),
    environnement: new EnvironnementEnMemoire(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });
}

describe("LancePassageDeFumee", () => {
  test("sert la cible triviale sur 127.0.0.1:8080 puis y lance Shannon, décrit selon le fournisseur du modèle", async () => {
    const journal: string[] = [];
    const serveur = new ServeurCibleFumeeSimule(journal);
    const shannon = new ShannonSimule({ apresLeRun: () => journal.push("Shannon lancé") });

    await unPassage({ serveur, shannon }).execute();

    expect(journal.slice(0, 2)).toEqual(["cible servie sur 8080", "Shannon lancé"]);
    expect(shannon.lancements[0]).toMatchObject({
      url: "http://host.docker.internal:8080",
      depot: "/depot/outils/shannon/smoke-target",
      modelsConfig: "/depot/outils/shannon/configs/models.albert.json",
    });
  });

  test("sert et vise le port demandé par SMOKE_PORT", async () => {
    const journal: string[] = [];
    const shannon = new ShannonSimule();

    await unPassage({
      serveur: new ServeurCibleFumeeSimule(journal),
      shannon,
      environnement: new EnvironnementEnMemoire({ SMOKE_PORT: "9090" }),
    }).execute();

    expect(journal[0]).toBe("cible servie sur 9090");
    expect(shannon.lancements[0].url).toBe("http://host.docker.internal:9090");
  });

  test("se contente par défaut des prompts minimaux de Shannon (pipeline de test)", async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon }).execute();

    expect(shannon.lancements[0].pipelineTesting).toBe(true);
  });

  test("lance les vrais prompts, avec le vrai agent de rapport, quand SMOKE_REAL=1", async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon, environnement: new EnvironnementEnMemoire({ SMOKE_REAL: "1" }) }).execute();

    expect(shannon.lancements[0].pipelineTesting).toBe(false);
  });

  test("ouvre un workspace neuf, nommé d'après le fournisseur et horodaté", async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon }).execute();

    expect(shannon.lancements[0].workspace).toBe("albert-smoke-1790000000");
  });

  test("reprend le workspace désigné par SMOKE_WORKSPACE", async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon, environnement: new EnvironnementEnMemoire({ SMOKE_WORKSPACE: "albert-smoke-1" }) }).execute();

    expect(shannon.lancements[0].workspace).toBe("albert-smoke-1");
  });

  test("transmet à Shannon l'environnement du shell complété par shannon.env", async () => {
    const shannon = new ShannonSimule();

    await unPassage({ shannon, environnement: new EnvironnementEnMemoire({ PATH: "/usr/bin" }) }).execute();

    expect(shannon.lancements[0].environnement).toMatchObject({
      PATH: "/usr/bin",
      SHANNON_AI_MODEL: "albert:openai/gpt-oss-120b",
      SHANNON_AI_API_KEY: "cle",
    });
  });

  test("exige un modèle désigné : aucun fournisseur n'est privilégié", async () => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier("outils/shannon/shannon.env", "SHANNON_AI_API_KEY=cle\n");

    await expect(unPassage({ serveur, shannon, systemeDeFichier }).execute()).rejects.toThrow(
      "Erreur : SHANNON_AI_MODEL non renseigné (outils/shannon/shannon.env), ex. albert:openai/gpt-oss-120b",
    );
    expect(serveur.enService).toBe(false);
    expect(shannon.lancements).toEqual([]);
  });

  test("lance sans description pi un modèle que Shannon connaît nativement", async () => {
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier("outils/shannon/shannon.env", "SHANNON_AI_MODEL=anthropic:claude-sonnet-4-6\n");

    await unPassage({ shannon, systemeDeFichier }).execute();

    expect(shannon.lancements[0].modelsConfig).toBeUndefined();
  });

  test("arrête toujours la cible servie, même quand Shannon échoue", async () => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule({ echec: new Error("direnv introuvable") });

    await expect(unPassage({ serveur, shannon }).execute()).rejects.toThrow("direnv introuvable");
    expect(serveur.enService).toBe(false);
  });

  test.each([
    ["outils/shannon/shannon.env", "Fichier manquant : outils/shannon/shannon.env (depuis shannon.env.template)"],
    ["outils/shannon/source/apps/cli/dist/index.mjs", "CLI Shannon non construite (cd outils/shannon/source && pnpm build)"],
  ])("ne sert ni ne lance rien sans %s", async (absent, message) => {
    const serveur = new ServeurCibleFumeeSimule();
    const shannon = new ShannonSimule();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.fichiers.delete(absent);

    await expect(unPassage({ serveur, shannon, systemeDeFichier }).execute()).rejects.toThrow(message);
    expect(serveur.enService).toBe(false);
    expect(shannon.lancements).toEqual([]);
  });
});
