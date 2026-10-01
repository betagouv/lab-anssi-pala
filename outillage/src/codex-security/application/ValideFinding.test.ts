import { describe, expect, test } from "vitest";
import { CliCodexSecuritySimulee } from "../../../test/doubles/CliCodexSecuritySimulee.ts";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { EnvironnementEnMemoire } from "../../../test/doubles/EnvironnementEnMemoire.ts";
import { HorlogeFigee } from "../../../test/doubles/HorlogeFigee.ts";
import { ReseauSimule } from "../../../test/doubles/ReseauSimule.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { ValidationCodexSimulee } from "../../../test/doubles/ValidationCodexSimulee.ts";
import { type Dependances, ValideFinding } from "./ValideFinding.ts";

const CIBLE = "/depot/cible/copies/app";
const FINDING = { title: "Exemple de finding", cwe: ["CWE-200"] };

// Un dépôt prêt : environnement du proxy généré, cible clonée, finding à valider rédigé.
function unDepotPret() {
  const systemeDeFichier = new SystemeDeFichierEnMemoire({
    "outils/codex-security/codex-security.env": "LITELLM_MASTER_KEY=sk-local-jeton\n",
    "finding.json": JSON.stringify(FINDING),
  });
  systemeDeFichier.creeDossier(CIBLE);
  return systemeDeFichier;
}

function uneValidation(doubles: Partial<Dependances> = {}) {
  return new ValideFinding({
    racine: "/depot",
    cli: new CliCodexSecuritySimulee(),
    validation: new ValidationCodexSimulee(),
    systemeDeFichier: unDepotPret(),
    reseau: new ReseauSimule(),
    horloge: new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9)),
    environnement: new EnvironnementEnMemoire({ CODEX_TARGET: CIBLE }),
    console: new ConsoleEnMemoire(),
    ...doubles,
  });
}

describe("ValideFinding", () => {
  test("valide le finding sur la cible, avec la config, vers une sortie horodatée", async () => {
    const validation = new ValidationCodexSimulee();

    await uneValidation({ validation }).execute({ findingFile: "finding.json" });

    expect(validation.demandes).toEqual([
      expect.objectContaining({
        cible: CIBLE,
        config: "/depot/outils/codex-security/configs/config-defaut.yaml",
        finding: FINDING,
        sortie: "/depot/resultats/brut/codex-security/validate-20260930-140509",
      }),
    ]);
  });

  test("écrit le résumé validation-result.json, avec la durée de la validation arrondie en secondes", async () => {
    const horloge = new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9));
    const validation = new ValidationCodexSimulee({ horloge, dureeMs: 42_600 });
    const systemeDeFichier = unDepotPret();
    const sortie = "/depot/resultats/brut/codex-security/validate-20260930-140509";

    await uneValidation({ horloge, validation, systemeDeFichier }).execute({ findingFile: "finding.json" });

    expect(JSON.parse(systemeDeFichier.lit(`${sortie}/validation-result.json`))).toEqual({
      disposition: "confirmed",
      threadId: "fil-1",
      outputDir: sortie,
      durationSeconds: 43,
      finding: FINDING,
    });
  });

  test("écrit le rapport de validation validation-report.md", async () => {
    const systemeDeFichier = unDepotPret();

    await uneValidation({ systemeDeFichier }).execute({ findingFile: "finding.json" });

    expect(systemeDeFichier.lit("/depot/resultats/brut/codex-security/validate-20260930-140509/validation-report.md")).toBe(
      "# Rapport\n",
    );
  });

  test("affiche sur la sortie standard une synthèse JSON d'une ligne", async () => {
    const horloge = new HorlogeFigee(new Date(2026, 8, 30, 14, 5, 9));
    const validation = new ValidationCodexSimulee({ horloge, dureeMs: 42_600 });
    const console = new ConsoleEnMemoire();

    await uneValidation({ horloge, validation, console }).execute({ findingFile: "finding.json" });

    expect(console.lignes.map(l => l.message)[3]).toEqual(
      '{"disposition":"confirmed","outputDir":"/depot/resultats/brut/codex-security/validate-20260930-140509","durationSeconds":43}',
    );
  });

  test("annonce cible, config et sortie en traces, hors de la sortie standard réservée à la synthèse", async () => {
    const console = new ConsoleEnMemoire();

    await uneValidation({ console }).execute({ findingFile: "finding.json" });

    expect(console.lignes.map(l => l.message).splice(0,3)).toEqual([
      `Cible  : ${CIBLE}`,
      "Config : /depot/outils/codex-security/configs/config-defaut.yaml",
      "Sortie : /depot/resultats/brut/codex-security/validate-20260930-140509",
    ]);
  });

  test("ferme la validation même quand elle échoue", async () => {
    const validation = new ValidationCodexSimulee({ echec: new Error("réponse rejetée par le SDK") });

    await expect(uneValidation({ validation }).execute({ findingFile: "finding.json" })).rejects.toThrow(
      "réponse rejetée par le SDK",
    );
    expect(validation.fermee).toBe(true);
  });

  test("refuse un finding qui n'est pas du JSON, sans lancer de validation", async () => {
    const systemeDeFichier = unDepotPret();
    systemeDeFichier.ecritFichier("finding.json", "titre: exemple de finding");
    const validation = new ValidationCodexSimulee();

    await expect(uneValidation({ systemeDeFichier, validation }).execute({ findingFile: "finding.json" })).rejects.toThrow(
      "Finding illisible : finding.json n'est pas un JSON valide",
    );
    expect(validation.demandes).toEqual([]);
  });
});
