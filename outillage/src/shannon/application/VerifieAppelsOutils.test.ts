import { describe, expect, test } from "vitest";
import { ApiChatSimulee } from "../../../test/doubles/ApiChatSimulee.ts";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { type Dependances, VerifieAppelsOutils } from "./VerifieAppelsOutils.ts";

const DESCRIPTION_ALBERT = JSON.stringify({ providers: { albert: { baseUrl: "https://albert.example/v1" } } });

// Shannon configuré sur un modèle servi par Albert, décrit par sa description pi.
function unDepotPret() {
  return new SystemeDeFichierEnMemoire({
    "outils/shannon/shannon.env": "SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\nSHANNON_AI_API_KEY=cle-shannon\n",
    "/depot/outils/shannon/configs/models.albert.json": DESCRIPTION_ALBERT,
  });
}

function uneVerification(doubles: Partial<Dependances> = {}) {
  return new VerifieAppelsOutils({
    racine: "/depot",
    apiChat: new ApiChatSimulee(),
    systemeDeFichier: unDepotPret(),
    environnement: new EnvironnementEnMemoire({ RUNS: "1" }),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });
}

describe("VerifieAppelsOutils", () => {
  test("exige la clé de Shannon, sans jamais l'afficher", async () => {
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier("outils/shannon/shannon.env", "SHANNON_AI_MODEL=albert:openai/gpt-oss-120b\n");

    await expect(uneVerification({ systemeDeFichier }).execute({})).rejects.toThrow(
      "Clé absente : définir SHANNON_AI_API_KEY (outils/shannon/shannon.env ou environnement).",
    );
  });

  test("interroge le modèle de Shannon chez son fournisseur, à l'URL de sa description pi", async () => {
    const apiChat = new ApiChatSimulee();

    await uneVerification({ apiChat }).execute({});

    expect(apiChat.demandes[0]).toMatchObject({
      url: "https://albert.example/v1",
      cle: "cle-shannon",
      modele: "openai/gpt-oss-120b",
    });
  });

  test("valide émission et multi-tour quand le modèle appelle l'outil puis répond à son résultat", async () => {
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({ console }).execute({});

    expect(statut).toBe(0);
    expect(console.lignes.map(l => l.message).slice(-2)).toEqual([
      "Emission de tool_calls valides : 1/1",
      "Enchainement multi-tour        : 1/1",
    ]);
  });

  test("répète la sonde RUNS fois, avec une ligne par essai puis le bilan", async () => {
    const console = new ConsoleEnMemoire();

    await uneVerification({ console, environnement: new EnvironnementEnMemoire({ RUNS: "3" }) }).execute({});

    expect(console.lignes.map(l => l.message).slice(-6)).toEqual([
      'essai 1: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      'essai 2: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      'essai 3: emission=OK  multi-tour=OK  {"finish":"tool_calls","tokens":42}',
      "",
      "Emission de tool_calls valides : 3/3",
      "Enchainement multi-tour        : 3/3",
    ]);
  });

  const appel = (nom: string, args: string) => [{ id: "appel-1", function: { name: nom, arguments: args } }];

  test.each([
    [undefined, "aucun tool_calls structure"],
    [appel("lire", '{"command":"ls"}'), "outil inattendu: 'lire'"],
    [appel("execute", "command=ls"), "arguments non JSON"],
    [appel("execute", '{"command":""}'), "parametre 'command' absent ou vide"],
    [appel("execute", "{}"), "parametre 'command' absent ou vide"],
  ])("refuse l'émission %j : %s", async (appels, raison) => {
    const apiChat = new ApiChatSimulee([{ reponse: { message: { role: "assistant", content: "ls", tool_calls: appels } } }]);
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({ apiChat, console }).execute({});

    expect(statut).toBe(1);
    expect(console.lignes.map(l => l.message)).toContain(`essai 1: emission=KO  multi-tour=KO  {"emission":"${raison}"}`);
  });

  test("valide le multi-tour quand le modèle enchaîne un nouvel appel valide au lieu de répondre", async () => {
    const executeLs = { reponse: { message: { role: "assistant", tool_calls: appel("execute", '{"command":"ls"}') } } };
    const executeCat = { reponse: { message: { role: "assistant", content: "", tool_calls: appel("execute", '{"command":"cat README.md"}') } } };
    const console = new ConsoleEnMemoire();

    const statut = await uneVerification({ apiChat: new ApiChatSimulee([executeLs, executeCat]), console }).execute({});

    expect(statut).toBe(0);
    expect(console.lignes.map(l => l.message)).toContain("essai 1: emission=OK  multi-tour=OK  {}");
  });

  test("refuse le multi-tour quand le modèle ne répond pas et n'enchaîne aucun appel valide", async () => {
    const executeLs = { reponse: { message: { role: "assistant", tool_calls: appel("execute", '{"command":"ls"}') } } };
    const rienDExploitable = { reponse: { message: { role: "assistant", content: "  ", tool_calls: appel("execute", "{}") } } };
    const console = new ConsoleEnMemoire();

    await uneVerification({ apiChat: new ApiChatSimulee([executeLs, rienDExploitable]), console }).execute({});

    expect(console.lignes.map(l => l.message)).toContain(
      `essai 1: emission=OK  multi-tour=KO  {"multitour":"ni reponse ni nouvel appel valide (parametre 'command' absent ou vide)"}`,
    );
  });

  test("consigne l'erreur réseau ou HTTP de l'émission comme du second tour", async () => {
    const executeLs = { reponse: { message: { role: "assistant", tool_calls: appel("execute", '{"command":"ls"}') } } };
    const console = new ConsoleEnMemoire();

    await uneVerification({
      apiChat: new ApiChatSimulee([{ erreur: "http_401: clé invalide" }, executeLs, { erreur: "reseau: TimeoutError" }]),
      environnement: new EnvironnementEnMemoire({ RUNS: "2" }),
      console,
    }).execute({});

    expect(console.lignes.map(l => l.message)).toEqual(
      expect.arrayContaining([
        'essai 1: emission=KO  multi-tour=KO  {"emission":"http_401: clé invalide"}',
        'essai 2: emission=OK  multi-tour=KO  {"multitour":"reseau: TimeoutError"}',
      ]),
    );
  });

  test("annonce le modèle vérifié, l'URL de son fournisseur et le nombre d'essais", async () => {
    const console = new ConsoleEnMemoire();

    await uneVerification({ console }).execute({});

    expect(console.lignes.map(l => l.message).slice(0, 2)).toEqual(["Modèle openai/gpt-oss-120b sur https://albert.example/v1, 1 essai(s)", ""]);
  });

  test("vérifie le modèle désigné au lancement, chez son propre fournisseur", async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier(
      "/depot/outils/shannon/configs/models.scaleway.json",
      JSON.stringify({ providers: { scaleway: { baseUrl: "https://scaleway.example/v1" } } }),
    );

    await uneVerification({ apiChat, systemeDeFichier }).execute({ modele: "scaleway:deepseek-v4-flash-0731" });

    expect(apiChat.demandes[0]).toMatchObject({ url: "https://scaleway.example/v1", modele: "deepseek-v4-flash-0731" });
  });

  test("lit l'URL dans la description pi imposée plutôt que dans celle déduite du fournisseur", async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier(
      "/mes-modeles.json",
      JSON.stringify({ providers: { albert: { baseUrl: "https://albert-recette.example/v1" } } }),
    );

    await uneVerification({ apiChat, systemeDeFichier }).execute({ modelsConfig: "/mes-modeles.json" });

    expect(apiChat.demandes[0].url).toBe("https://albert-recette.example/v1");
  });

  test("refuse un fournisseur sans description pi : aucune URL à interroger", async () => {
    const apiChat = new ApiChatSimulee();

    await expect(uneVerification({ apiChat }).execute({ modele: "anthropic:claude-sonnet-4-6" })).rejects.toThrow(
      "Aucune URL pour le fournisseur « anthropic » : fournir sa description pi (--models-config)",
    );
    expect(apiChat.demandes).toEqual([]);
  });

  test("se contente de l'environnement du shell en l'absence de shannon.env", async () => {
    const apiChat = new ApiChatSimulee();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.fichiers.delete("outils/shannon/shannon.env");
    const environnement = new EnvironnementEnMemoire({
      RUNS: "1",
      SHANNON_AI_MODEL: "albert:openai/gpt-oss-120b",
      SHANNON_AI_API_KEY: "cle-du-shell",
    });

    await uneVerification({ apiChat, systemeDeFichier, environnement }).execute({});

    expect(apiChat.demandes[0].cle).toBe("cle-du-shell");
  });
});
