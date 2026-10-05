import { describe, expect, test } from "vitest";
import { CliCodexSecuritySimulee } from "../../doubles/CliCodexSecuritySimulee.ts";
import { ConsoleEnMemoire } from "../../doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../doubles/EnvironnementEnMemoire.ts";
import { EstimationDuCoutSimulee } from "../../doubles/EstimationDuCoutSimulee.ts";
import { HorlogeFigee } from "../../doubles/HorlogeFigee.ts";
import { ReseauSimule } from "../../doubles/ReseauSimule.ts";
import { SystemeDeFichierEnMemoire } from "../../doubles/SystemeDeFichierEnMemoire.ts";
import { type Dependances, LanceScan } from "../../../src/codex-security/application/lanceScan.ts";

const CIBLE = "/depot/cible/copies/app";

function unDepotPret() {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    "outils/codex-security/codex-security.env": "ALBERT_API_KEY=cle-albert\nLITELLM_MASTER_KEY=sk-local-jeton\n",
    "/depot/outils/codex-security/configs/config-defaut.yaml": "codex:\n  model: deepseek-v4-flash-albert\n  model_provider: albert\n",
    "/depot/resultats/brut/codex-security/scan-20260930-140509.stdout.log": "LOG: \n TOKENS   100,000 uncached input, 10,000 cache reads, 0 cache writes, 10,500 output, 120,500 total"
  });
  systemeDeFichier.creeDossier(CIBLE);
  return systemeDeFichier;
}

function unScan(doubles: Partial<Dependances> = {}) {
  return new LanceScan({
    racine: "/depot",
    cli: new CliCodexSecuritySimulee(),
    systemeDeFichier: unDepotPret(),
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9)),
    environnement: new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE }),
    estimation: new EstimationDuCoutSimulee(),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });
}

describe("LanceScan", () => {
  test("refuse de scanner sans la CLI Codex Security", async () => {
    const cli = new CliCodexSecuritySimulee({ installee: false });

    await expect(unScan({ cli }).execute({ options: [] })).rejects.toThrow(
      "CLI absente : lancer pnpm bootstrap (npm ci dans outils/codex-security)",
    );
  });

  test("refuse de scanner sans l'environnement du proxy", async () => {
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.fichiers.delete("outils/codex-security/codex-security.env");

    await expect(unScan({ systemeDeFichier }).execute({ options: [] })).rejects.toThrow(
      "Fichier manquant : outils/codex-security/codex-security.env (lancer pnpm start-proxy)",
    );
  });

  test("refuse de scanner sans cible désignée par CODEX_TARGET (aucune cible par défaut)", async () => {
    const environnement = new EnvironnementEnMemoire({});

    await expect(unScan({ environnement }).execute({ options: [] })).rejects.toThrow(
      'CODEX_TARGET non défini : indiquer la cible, ex. CODEX_TARGET="$PWD/cible/copies/<nom>" (voir pnpm bootstrap --project <nom> --url <git-url>)',
    );
  });

  test("refuse de scanner une cible absente du disque", async () => {
    const environnement = new EnvironnementEnMemoire({ CODEX_TARGET: "/depot/cible/copies/absente" });

    await expect(unScan({ environnement }).execute({ options: [] })).rejects.toThrow(
      "Cible manquante : /depot/cible/copies/absente (cloner via pnpm bootstrap --project <nom> --url <git-url>)",
    );
  });

  test("refuse de scanner quand le proxy LiteLLM ne répond pas sur son port", async () => {
    const reseau = new ReseauSimule([false]);
    const environnement = new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE, LITELLM_PORT: "4100" });

    await expect(unScan({ reseau, environnement }).execute({ options: [] })).rejects.toThrow(
      "Proxy LiteLLM injoignable sur 127.0.0.1:4100 (lancer pnpm start-proxy)",
    );
    expect(reseau.urlsInterrogees).toEqual(["http://127.0.0.1:4100/health/liveliness"]);
  });

  test("scanne la cible avec la config par défaut, en transmettant les options de l'utilisateur", async () => {
    const cli = new CliCodexSecuritySimulee();
    const console = new ConsoleEnMemoire();

    await unScan({ cli, console }).execute({ options: ["--verbose", "--mode", "deep"] });

    expect(cli.scans[0]).toMatchObject({
      cible: CIBLE,
      config: "/depot/outils/codex-security/configs/config-defaut.yaml",
    });
    expect(cli.scans[0].options).toEqual(expect.arrayContaining(["--verbose", "--mode", "deep"]));
    expect(console.lignes.map(l => l.message).slice(0, 2)).toEqual([
      `Cible  : ${CIBLE}`,
      "Config : /depot/outils/codex-security/configs/config-defaut.yaml",
    ]);
  });

  test("CODEX_CONFIG impose la configuration du scan", async () => {
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.fichiers.set("/configs/ciblee.yaml", "codex:\n  model: glm-5.2\n  model_provider: scaleway\n");
    const environnement = new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE, CODEX_CONFIG: "/configs/ciblee.yaml" });

    await unScan({ cli, systemeDeFichier, environnement }).execute({ options: [] });

    expect(cli.scans[0].config).toBe("/configs/ciblee.yaml");
  });

  test("sort dans un dossier horodaté privé, avec le log écrit à côté (Codex exige une sortie vide)", async () => {
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotPret();
    const console = new ConsoleEnMemoire();
    const sortie = "/depot/resultats/brut/codex-security/scan-20260930-140509";

    await unScan({ cli, systemeDeFichier, console }).execute({ options: [] });

    expect(cli.scans[0]).toMatchObject({ sortie, journal: `${sortie}.stdout.log` });
    expect(systemeDeFichier.dossiersPrives).toContain(sortie);
    expect(console.lignes.map(l => l.message)[2]).toBe(`Sortie : ${sortie}`);
  });

  test("CODEX_OUTPUT impose la sortie, sans y placer le log même avec un / final", async () => {
    const cli = new CliCodexSecuritySimulee();
    const environnement = new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE, CODEX_OUTPUT: "/tmp/scan-a/" });

    await unScan({ cli, environnement }).execute({ options: [] });

    expect(cli.scans[0]).toMatchObject({ sortie: "/tmp/scan-a", journal: "/tmp/scan-a.stdout.log" });
  });

  test("ne transmet à Codex que le jeton local du proxy, jamais une clé OpenAI", async () => {
    const cli = new CliCodexSecuritySimulee();
    const environnement = new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE, PATH: "/usr/bin", OPENAI_API_KEY: "sk-openai" });

    await unScan({ cli, environnement }).execute({ options: [] });

    const transmis = cli.scans[0].environnement;
    expect(transmis).toMatchObject({ LITELLM_API_KEY: "sk-local-jeton", CODEX_API_KEY: "sk-local-jeton", PATH: "/usr/bin" });
    expect(transmis).not.toHaveProperty("OPENAI_API_KEY");
  });

  test("isole l'identité et l'historique de Codex dans des dossiers privés, et désigne le script d'artefacts", async () => {
    const cli = new CliCodexSecuritySimulee();
    const systemeDeFichier = unDepotPret();

    await unScan({ cli, systemeDeFichier }).execute({ options: [] });

    expect(cli.scans[0].environnement).toMatchObject({
      CODEX_HOME: "/depot/outils/codex-security/codex-home",
      CODEX_SECURITY_STATE_DIR: "/depot/outils/codex-security/state",
      CODEX_SECURITY_NO_UPDATE_NOTICE: "1",
      CODEX_SCAN_ECRIT_ARTEFACTS: "/depot/outils/codex-security/scripts/ecrit-artefacts-scan.py",
    });
    expect([...systemeDeFichier.dossiersPrives]).toEqual(
      expect.arrayContaining(["/depot/outils/codex-security/codex-home", "/depot/outils/codex-security/state"]),
    );
  });

  test("estime le coût du scan à partir de son log, avec le modèle et le fournisseur de la config", async () => {
    const estimation = new EstimationDuCoutSimulee();

    await unScan({ estimation }).execute({ options: [] });

    expect(estimation.releves).toEqual([
      {
        cache: 10000,
        entree: 100000,
        fournisseur: "albert",
        modele: "deepseek-v4-flash-albert",
        sortie: 10500
      },
    ]);
  });

  test("renvoie le statut du scan même quand l'estimation du coût échoue", async () => {
    const cli = new CliCodexSecuritySimulee({ statutDuScan: 3 });
    const console = new ConsoleEnMemoire();
    const estimation = new EstimationDuCoutSimulee({ console });

    const statut = await unScan({ cli, estimation, console }).execute({ options: [] }, () => {
      throw new Error("Fichier introuvable : scan.stdout.log")
    });

    expect(statut).toBe(3);
    expect(console.erreurs.map(l => l.message)).toEqual(["Estimation du coût impossible : Fichier introuvable : scan.stdout.log"]);
  });

  test("suit par défaut les consignes de scan du dépôt, sans lesquelles DeepSeek n'écrit pas findings.json", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScan({ cli }).execute({ options: ["--dry-run"] });

    expect(cli.scans[0].options).toEqual(
      expect.arrayContaining(["--scan-prompt-file", "/depot/outils/codex-security/configs/consignes-scan.md"]),
    );
  });

  test("demande par défaut un log bavard, dont le relevé TOKENS permet d'estimer le coût", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScan({ cli }).execute({ options: [] });

    expect(cli.scans[0].options).toContain("--verbose");
  });

  test("respecte les consignes de l'utilisateur, même écrites --scan-prompt-file=<fichier>", async () => {
    const cli = new CliCodexSecuritySimulee();

    await unScan({ cli }).execute({ options: ["--scan-prompt-file=/mes-consignes.md"] });

    expect(cli.scans[0].options).toEqual(["--verbose", "--scan-prompt-file=/mes-consignes.md"]);
  });
});
