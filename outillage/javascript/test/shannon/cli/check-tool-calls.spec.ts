import { describe, expect, test } from "vitest";
import { ApiChatSimulee } from "../../doubles/ApiChatSimulee.ts";
import { ConsoleEnMemoire } from "../../doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../doubles/EnvironnementEnMemoire.ts";
import { SystemeDeFichierEnMemoire } from "../../doubles/SystemeDeFichierEnMemoire.ts";
import { checkToolCalls } from "../../../src/shannon/cli/check-tool-calls.ts";

describe("check-tool-calls (ligne de commande)", () => {
  test("vérifie le modèle et la description pi désignés (chemin relatif au répertoire d'appel)", async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({
      "/home/auditeur/modeles.json": JSON.stringify({ providers: { scaleway: { baseUrl: "https://scaleway.example/v1" } } }),
    });

    const code = await checkToolCalls(["--model", "scaleway:deepseek-v4-flash-0731", "--models-config", "modeles.json"], {
      racine: "/depot",
      repertoireAppel: "/home/auditeur",
      apiChat,
      systemeDeFichier,
      environnement: new EnvironnementEnMemoire({ RUNS: "1", SHANNON_AI_API_KEY: "cle" }),
      console: new ConsoleEnMemoire(),
    });

    expect(code).toBe(0);
    expect(apiChat.demandes[0]).toMatchObject({ url: "https://scaleway.example/v1", modele: "deepseek-v4-flash-0731" });
  });
});
