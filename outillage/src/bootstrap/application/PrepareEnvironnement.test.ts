import { describe, expect, test, it } from "vitest";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { GitSimule } from "../../../test/doubles/GitSimule.ts";
import { PreparationOutilSimulee } from "../../../test/doubles/PreparationOutilSimulee.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { Cible } from "../domaine/Cible.ts";
import { type Dependances, PrepareEnvironnement } from "./PrepareEnvironnement.ts";

// Cas d'usage avec un double par défaut pour chaque dépendance : chaque test ne fournit que ceux
// dont il observe les effets.
function unePreparation(doubles: Partial<Dependances> = {}) {
  return new PrepareEnvironnement({
    git: new GitSimule(),
    systemeDeFichier: new SystemeDeFichierEnMemoire(),
    console: new ConsoleEnMemoire(),
    outils: [],
    ...doubles,
  });
}

describe("PrepareEnvironnement", () => {
  test("initialise les sous-modules des outils", async () => {
    const git = new GitSimule();

    await unePreparation({ git }).execute({});

    expect(git.sousModulesInitialises).toBe(true);
  });

  test("crée le dossier des copies de scan", async () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire();

    await unePreparation({ systemeDeFichier }).execute({});

    expect(systemeDeFichier.existe("cible/copies")).toBe(true);
  });

  test("clone la cible demandée dans sa copie de travail, sur la branche par défaut du dépôt distant", async () => {
    const git = new GitSimule();
    const cible = new Cible({ nom: "app", url: "https://git.example/app.git" });

    await unePreparation({ git }).execute({ cible });

    expect(git.clonages).toEqual([{ url: "https://git.example/app.git", branche: undefined, copie: "cible/copies/app" }]);
  });

  test("conserve une copie de travail existante sans la recloner", async () => {
    const git = new GitSimule();
    const systemeDeFichier = new SystemeDeFichierEnMemoire();
    systemeDeFichier.creeDossier("cible/copies/app");
    const console = new ConsoleEnMemoire();

    await unePreparation({ git, systemeDeFichier, console }).execute({
      cible: new Cible({ nom: "app", url: "https://git.example/app.git" }),
    });

    expect(git.clonages).toEqual([]);
    expect(console.lignes.map(ligne => ligne.message)).toContain("    conservé : cible/copies/app (déjà présent)");
  });

  test("annonce le clonage de la cible, avec la branche demandée, puis la copie créée", async () => {
    const console = new ConsoleEnMemoire();

    await unePreparation({ console }).execute({
      cible: new Cible({ nom: "app", url: "https://git.example/app.git", branche: "main" }),
    });

    expect(console.lignes.map(ligne => ligne.message)).toEqual(
      expect.arrayContaining([
        "    clone de la cible « app » depuis https://git.example/app.git (branche main)",
        "    créé : cible/copies/app",
      ]),
    );
  });

  test("sans cible demandée, n'en clone aucune et indique comment en cloner une", async () => {
    const git = new GitSimule();
    const console = new ConsoleEnMemoire();

    await unePreparation({ git, console }).execute({});

    expect(git.clonages).toEqual([]);
    expect(console.lignes.map(ligne => ligne.message)).toContain(
      "    (aucune cible demandée : passer --project <nom> --url <git-url> pour en cloner une)",
    );
  });

  test("prépare chaque outil du registre, dans l'ordre, en l'annonçant", async () => {
    const console = new ConsoleEnMemoire();
    const journal: string[] = [];
    const codex = new PreparationOutilSimulee("codex-security", journal);
    const shannon = new PreparationOutilSimulee("shannon", journal);

    await unePreparation({ console, outils: [codex, shannon] }).execute({});

    expect(journal).toEqual(["codex-security", "shannon"]);
    expect(console.lignes.map(ligne => ligne.message)).toEqual(expect.arrayContaining(["==> Préparation de codex-security", "==> Préparation de shannon"]));
  });

  test("récapitule les fichiers d'environnement à renseigner, présents ou à créer", async () => {
    const console = new ConsoleEnMemoire();
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "outils/shannon/shannon.env": "SHANNON_AI_MODEL=albert:x" });
    const outils = [
      new PreparationOutilSimulee("codex-security", [], "outils/codex-security/codex-security.env"),
      new PreparationOutilSimulee("shannon", [], "outils/shannon/shannon.env"),
    ];

    await unePreparation({ console, systemeDeFichier, outils }).execute({});

    expect(console.lignes.slice(-5).map(ligne => ligne.message)).toEqual([
      "==> Terminé. Fichiers d'environnement à renseigner (non versionnés) :",
      "    .env                             (depuis .env.example — clé Albert commune)",
      "    outils/codex-security/codex-security.env (depuis codex-security.env.template — à créer)",
      "    outils/shannon/shannon.env       (depuis shannon.env.template — présent)",
      "    ainsi que les configs Shannon remplies, depuis outils/shannon/configs/*.template.yaml.",
    ]);
  });

  test("rappelle comment cibler la copie de travail avec chaque outil", async () => {
    const console = new ConsoleEnMemoire();

    await unePreparation({ console }).execute({ cible: new Cible({ nom: "app", url: "https://git.example/app.git" }) });

    expect(console.lignes.slice(-6).map(ligne => ligne.message)).toEqual([
      "",
      "==> Cible prête : cible/copies/app",
      '    Codex Security :',
      '       Pour un scan par défaut : CODEX_TARGET="$PWD/cible/copies/app" pnpm scan',
      '       Pour un scan avec configuration : CODEX_TARGET="$PWD/cible/copies/app" CODEX_CONFIG="$PWD/outils/codex-security/configs/<fichier_config>.yaml" pnpm scan',
      "    Shannon        : pnpm shannon --project app --url <url-app> --config <fichier>",
    ]);
  });

  it('colore la sortie du bootstrap', async () => {
    const laConsole = new ConsoleEnMemoire();

    await unePreparation({ console: laConsole }).execute({ cible: new Cible({ nom: "app", url: "https://git.example/app.git" }) });

    let lesDernieresLignes = laConsole.lignes.slice(-6);

    expect(lesDernieresLignes[1].couleur).toBe('VERT')
    expect(lesDernieresLignes.slice(2, 4).every(l => l.couleur === 'BLEU')).toBe(true)
    expect(lesDernieresLignes.slice(5).every(l => l.couleur === 'JAUNE')).toBe(true)
  })
});
