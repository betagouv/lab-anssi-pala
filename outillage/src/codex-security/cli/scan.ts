// Adaptateur de ligne de commande du scan Codex Security (run-scan.sh).
import { Command } from "commander";
import { executeCommande } from "../../noyau/ligne-de-commande.ts";
import { type Dependances, LanceScan } from "../application/LanceScan.ts";

export async function scan(argv: string[], dependances: Dependances): Promise<number> {
  // Toutes les options, --help compris, sont celles de `codex-security scan` : transmises telles quelles.
  const programme = new Command("scan")
    .helpOption(false)
    .allowUnknownOption()
    .allowExcessArguments()
    .argument("[options...]");
  return executeCommande(programme, argv, dependances.console, () =>
    new LanceScan(dependances).execute({ options: programme.args }),
  );
}
