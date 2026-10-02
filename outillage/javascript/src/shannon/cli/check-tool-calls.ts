// Adaptateur de ligne de commande de la vérification des appels d'outils (check_tool_calls.py).
import { resolve } from "node:path";
import { Command } from "commander";
import { executeCommande } from "../../noyau/ligne-de-commande.ts";
import { type Dependances, VerifieAppelsOutils } from "../application/verifieAppelsOutils.ts";

export type DependancesCli = Dependances & { repertoireAppel: string };

export async function checkToolCalls(argv: string[], dependances: DependancesCli): Promise<number> {
  const programme = new Command("check-tool-calls")
    .description("Vérifie que le modèle de Shannon émet de vrais tool_calls structurés, sur plusieurs tours.")
    .option("--model <spec>", "modèle vérifié (fournisseur:modèle) ; défaut SHANNON_AI_MODEL")
    .option("--models-config <fichier>", "description pi du fournisseur ; défaut déduite du modèle")
    .addHelpText(
      "after",
      `
Clé : SHANNON_AI_API_KEY (outils/shannon/shannon.env ou environnement), jamais affichée.
Variables : RUNS (essais, défaut 5), MAX_TOKENS (défaut 4000). Attendu avant tout scan : 5/5 et 5/5.`,
    );
  return executeCommande(programme, argv, dependances.console, () => {
    const { model, modelsConfig } = programme.opts<{ model?: string; modelsConfig?: string }>();
    return new VerifieAppelsOutils(dependances).execute({
      modele: model,
      modelsConfig: modelsConfig && resolve(dependances.repertoireAppel, modelsConfig),
    });
  });
}
