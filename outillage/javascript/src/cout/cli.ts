// Adaptateur de ligne de commande de l'estimation de coût (équivalent de scripts/estimer-cout.py).
import { Command } from "commander";
import { ErreurUsage, executeCommande } from "../noyau/ligne-de-commande.ts";
import type { Console } from "../noyau/ports/Console.ts";
import type { SystemeDeFichier } from "../noyau/ports/SystemeDeFichier.ts";
import { EstimeCout } from "./application/estimeCout.ts";

type Dependances = { systemeDeFichier: SystemeDeFichier; console: Console };

type Options = {
  codexLog?: string;
  shannonSession?: string;
  provider: string;
  model: string;
  modelSpec?: string;
};

export async function estimerCout(argv: string[], dependances: Dependances): Promise<number> {
  const programme = new Command("estimer-cout")
    .description("Estime le coût d'un run à partir des tokens consommés")
    .option("--codex-log <fichier>", "log Codex Security (ligne « TOKENS … », mode --verbose)")
    .option("--shannon-session <fichier>", "session.json d'un workspace Shannon")
    .option("--provider <nom>", "fournisseur (Codex : model_provider de la config)", "")
    .option("--model <id>", "modèle (Codex : model de la config)", "")
    .option("--model-spec <fournisseur:modèle>", "valeur de SHANNON_AI_MODEL");

  return executeCommande(programme, argv, dependances.console, () => {
    const options = programme.opts<Options>();
    const estimation = new EstimeCout(dependances);
    if (options.codexLog) {
      estimation.surLogCodex({ log: options.codexLog, fournisseur: options.provider, modele: options.model });
    } else if (options.shannonSession) {
      estimation.surSessionShannon({ session: options.shannonSession, specModele: options.modelSpec ?? "" });
    } else {
      throw new ErreurUsage("Erreur : fournir --codex-log ou --shannon-session");
    }
    return 0;
  });
}
