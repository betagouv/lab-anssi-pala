import { describe, expect, test } from "vitest";
import { AttenteInstantanee } from "../../../test/doubles/AttenteInstantanee.ts";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { ConteneurProxySimule } from "../../../test/doubles/ConteneurProxySimule.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { GenerationEnvironnementSimulee } from "../../../test/doubles/GenerationEnvironnementSimulee.ts";
import { ReseauSimule } from "../../../test/doubles/ReseauSimule.ts";
import { type Dependances, DemarreProxy } from "./DemarreProxy.ts";

function unDemarrage(doubles: Partial<Dependances> = {}) {
  return new DemarreProxy({
    generation: new GenerationEnvironnementSimulee(),
    conteneur: new ConteneurProxySimule(),
    reseau: new ReseauSimule(),
    attente: new AttenteInstantanee(),
    environnement: new EnvironnementEnMemoire(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });
}

describe("DemarreProxy", () => {
  test("génère l'environnement du proxy avant de lancer le conteneur", async () => {
    const journal: string[] = [];

    await unDemarrage({
      generation: new GenerationEnvironnementSimulee(journal),
      conteneur: new ConteneurProxySimule(journal),
    }).execute();

    expect(journal[0]).toBe("environnement généré");
    expect(journal).toContain("conteneur démarré");
  });

  test("remplace le conteneur existant : supprimé, puis démarré", async () => {
    const journal: string[] = [];

    await unDemarrage({ conteneur: new ConteneurProxySimule(journal) }).execute();

    expect(journal).toEqual(["conteneur supprimé", "conteneur démarré"]);
  });

  test("démarre par défaut sur le port 4000 avec l'image LiteLLM figée par digest", async () => {
    const conteneur = new ConteneurProxySimule();

    await unDemarrage({ conteneur }).execute();

    expect(conteneur.configuration).toEqual({
      port: "4000",
      image: "ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02",
    });
  });

  test("LITELLM_PORT et LITELLM_IMAGE surchargent le port et l'image", async () => {
    const conteneur = new ConteneurProxySimule();
    const environnement = new EnvironnementEnMemoire({ LITELLM_PORT: "4100", LITELLM_IMAGE: "litellm:essai" });

    await unDemarrage({ conteneur, environnement }).execute();

    expect(conteneur.configuration).toEqual({ port: "4100", image: "litellm:essai" });
  });

  test("sans base de données, annonce que le plafond de budget n'est pas bloquant", async () => {
    const console = new ConsoleEnMemoire();

    await unDemarrage({ console }).execute();

    expect(console.lignes.map(l => l.message)).toContain(
      "Budget : suivi seul (pas de DATABASE_URL) — le plafond n'est pas bloquant. Voir le README.",
    );
  });

  test("avec LITELLM_DATABASE_URL, transmet la base au proxy et annonce le plafond appliqué", async () => {
    const conteneur = new ConteneurProxySimule();
    const console = new ConsoleEnMemoire();
    const environnement = new EnvironnementEnMemoire({ LITELLM_DATABASE_URL: "postgresql://budget" });

    await unDemarrage({ conteneur, console, environnement }).execute();

    expect(conteneur.configuration?.baseDeDonnees).toBe("postgresql://budget");
    expect(console.lignes.map(l => l.message)).toContain("Budget : enforcement actif (DATABASE_URL fournie).");
  });

  test("attend que le proxy réponde, toutes les 2 secondes, puis annonce qu'il est prêt", async () => {
    const reseau = new ReseauSimule([false, false, true]);
    const attente = new AttenteInstantanee();
    const console = new ConsoleEnMemoire();

    await unDemarrage({ reseau, attente, console }).execute();

    expect(reseau.urlsInterrogees).toEqual(Array(3).fill("http://127.0.0.1:4000/health/liveliness"));
    expect(attente.attentes).toEqual([2000, 2000]);
    expect(console.lignes.map(l => l.message).at(-1)).toBe("Attente du proxy LiteLLM.. : prêt sur http://127.0.0.1:4000/v1");
  });

  test("abandonne après 60 tentatives sans réponse du proxy", async () => {
    const reseau = new ReseauSimule([false]);

    await expect(unDemarrage({ reseau }).execute()).rejects.toThrow(
      "Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm",
    );
    expect(reseau.urlsInterrogees).toHaveLength(60);
  });
});
