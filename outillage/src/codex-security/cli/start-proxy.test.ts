import { describe, expect, test } from "vitest";
import { AttenteInstantanee } from "../../../test/doubles/AttenteInstantanee.ts";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { ConteneurProxySimule } from "../../../test/doubles/ConteneurProxySimule.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { GenerationEnvironnementSimulee } from "../../../test/doubles/GenerationEnvironnementSimulee.ts";
import { ReseauSimule } from "../../../test/doubles/ReseauSimule.ts";
import { startProxy } from "./start-proxy.ts";

describe("start-proxy (ligne de commande)", () => {
  test("signale l'échec du démarrage et sort en code 1", async () => {
    const console = new ConsoleEnMemoire();

    const code = await startProxy([], {
      generation: new GenerationEnvironnementSimulee(),
      conteneur: new ConteneurProxySimule(),
      reseau: new ReseauSimule([false]),
      attente: new AttenteInstantanee(),
      environnement: new EnvironnementEnMemoire(),
      console,
    });

    expect(code).toBe(1);
    expect(console.erreurs).toEqual(["Erreur: le proxy ne répond pas — voir docker logs codex-security-litellm"]);
  });
});
