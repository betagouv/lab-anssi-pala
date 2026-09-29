import { describe, expect, test } from "vitest";
import { ConsoleEnMemoire } from "../../../test/doubles/ConsoleEnMemoire.ts";
import { SystemeDeFichierEnMemoire } from "../../../test/doubles/SystemeDeFichierEnMemoire.ts";
import { EstimeCout } from "./EstimeCout.ts";

const RELEVE_CODEX =
  "  TOKENS   777,656 uncached input, 348,672 cache reads, 0 cache writes, 31,639 output, 1,157,967 total";

describe("EstimeCout", () => {
  test("estime le coût d'un scan Codex sur un modèle Scaleway, cache compté au tarif d'entrée", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": `Scan en cours…\n${RELEVE_CODEX}\n` });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "scaleway_deepseek",
      modele: "deepseek-v4-flash-0731",
    });

    expect(sortie.lignes).toEqual([
      "--- Coût estimé ---",
      "  Modèle    : deepseek-v4-flash-0731 (fournisseur scaleway_deepseek)",
      "  Tokens    : 1,126,328 entrée (dont 348,672 en cache), 31,639 sortie",
      "  Coût      : ~0.48 € (tarif Scaleway : 0.4 €/M entrée, 0.8 €/M sortie)",
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
    ]);
  });

  test("annonce un coût nul pour Albert, service gratuit de la DINUM", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": RELEVE_CODEX });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "albert",
      modele: "deepseek-v4-flash-albert",
    });

    expect(sortie.lignes.slice(3)).toEqual([
      "  Coût      : 0 € — Albert (DINUM), service gratuit",
      "  Note      : Albert sous-estime les tokens de sortie (raisonnement/outils non comptés).",
    ]);
  });

  test("invite à compléter la table des tarifs pour un modèle payant inconnu", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": RELEVE_CODEX });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "scaleway",
      modele: "modele-inconnu",
    });

    expect(sortie.lignes.slice(3)).toEqual([
      "  Coût      : tarif inconnu pour « modele-inconnu » — compléter TARIFS dans outillage/src/cout/domaine/Tarifs.ts",
    ]);
  });

  test("signale un coût non calculable quand le scan n'a pas publié son relevé (run non terminé)", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": "Scan en cours…\n" });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "albert",
      modele: "deepseek-v4-flash-albert",
    });

    expect(sortie.lignes).toEqual([
      "--- Coût estimé ---",
      "  tokens indisponibles (run non terminé ?) : coût non calculable",
    ]);
  });

  test("signale un coût non calculable quand le relevé de tokens est incomplet", () => {
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": "  TOKENS   12 uncached input, 3 output" });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "albert",
      modele: "deepseek-v4-flash-albert",
    });

    expect(sortie.lignes.at(-1)).toBe("  tokens indisponibles (run non terminé ?) : coût non calculable");
  });

  test("retient le dernier relevé complet, même si « TOKENS » est mentionné ensuite", () => {
    const log = `${RELEVE_CODEX}\nPlafond TOKENS atteint\n`;
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "scan.stdout.log": log });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surLogCodex({
      log: "scan.stdout.log",
      fournisseur: "albert",
      modele: "deepseek-v4-flash-albert",
    });

    expect(sortie.lignes[2]).toBe("  Tokens    : 1,126,328 entrée (dont 348,672 en cache), 31,639 sortie");
  });

  test("estime le coût d'un pentest Shannon en sommant les tokens de tous ses agents", () => {
    const session = {
      metrics: {
        agents: {
          recon: { total_input_tokens: 600_000, total_output_tokens: 60_000 },
          exploit: { total_input_tokens: 400_000, total_output_tokens: 40_000 },
        },
      },
    };
    const systemeDeFichier = new SystemeDeFichierEnMemoire({ "session.json": JSON.stringify(session) });
    const sortie = new ConsoleEnMemoire();

    new EstimeCout({ systemeDeFichier, console: sortie }).surSessionShannon({
      session: "session.json",
      specModele: "scaleway:glm-5.2",
    });

    expect(sortie.lignes).toEqual([
      "--- Coût estimé ---",
      "  Modèle    : glm-5.2 (fournisseur scaleway)",
      "  Tokens    : 1,000,000 entrée (dont 0 en cache), 100,000 sortie",
      "  Coût      : ~2.35 € (tarif Scaleway : 1.8 €/M entrée, 5.5 €/M sortie)",
      "  Note      : estimation haute (cache compté au tarif d'entrée) ; à confronter au relevé du fournisseur.",
    ]);
  });
});
