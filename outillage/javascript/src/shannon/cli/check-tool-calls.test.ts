import { describe, expect, test } from "vitest";
import { ApiChatSimulee } from "../../../test/doubles/ApiChatSimulee.ts";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { checkToolCalls } from "./check-tool-calls.ts";

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
