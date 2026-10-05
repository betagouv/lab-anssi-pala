// Adaptateur de ligne de commande de l'estimation de coût (équivalent de scripts/estimer-cout.py).
import {Command} from "commander";
import {ErreurUsage, executeCommande} from "../noyau/ligne-de-commande.ts";
import type {Console} from "../noyau/ports/Console.ts";
import type {SystemeDeFichier} from "../noyau/ports/SystemeDeFichier.ts";
import {EstimationDuCout} from "./application/estimationDuCout.ts";
import {unReleveDeConsommationDeTokensCodex, unReleveDeConsommationDeTokensShannon} from "./domaine/consommationDeTokens.ts";

type Dependances = { systemeDeFichier: SystemeDeFichier; console: Console };

type Options = {
  codexLog?: string;
  shannonSession?: string;
  provider: string;
  model: string;
  modelSpec?: string;
};

export const estimerCout = async (argv: string[], dependances: Dependances): Promise<number> => {
  const programme = new Command("estimer-cout")
    .description("Estime le coût d'un run à partir des tokens consommés")
    .option("--codex-log <fichier>", "log Codex Security (ligne « TOKENS … », mode --verbose)")
    .option("--shannon-session <fichier>", "session.json d'un workspace Shannon")
    .option("--provider <nom>", "fournisseur (Codex : model_provider de la config)", "")
    .option("--model <id>", "modèle (Codex : model de la config)", "")
    .option("--model-spec <fournisseur:modèle>", "valeur de SHANNON_AI_MODEL");

  return executeCommande(programme, argv, dependances.console, () => {
    const options = programme.opts<Options>();
    const estimation = new EstimationDuCout(dependances);
    if (options.codexLog) {
      const consommation = unReleveDeConsommationDeTokensCodex(dependances.systemeDeFichier.lit(options.codexLog), options.provider, options.model);
      estimation.rapporte(consommation);
    } else if (options.shannonSession) {
      const consommation  = unReleveDeConsommationDeTokensShannon(dependances.systemeDeFichier.lit(options.shannonSession), options.modelSpec ?? "");
      estimation.rapporte(consommation);
    } else {
      throw new ErreurUsage("Erreur : fournir --codex-log ou --shannon-session");
    }
    return 0;
  });
};
