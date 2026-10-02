// Adaptateur de ligne de commande du scan Codex Security (run-scan.sh).
import { Command } from "commander";
import { executeCommande } from "../../noyau/ligne-de-commande.ts";
import { type Dependances, LanceScan } from "../application/lanceScan.ts";

const AIDE = `Usage : CODEX_TARGET="$PWD/cible/copies/<nom>" [CODEX_CONFIG=…] pnpm scan [options de codex-security scan…]

Lance un scan Codex Security sur la copie de travail de la cible, via le proxy LiteLLM local
(pnpm start-proxy d'abord), puis en estime le coût.

Options ajoutées par défaut, chacune remplacée si vous la fournissez vous-même :
  --scan-prompt-file outils/codex-security/configs/consignes-scan.md
      consignes pas à pas : sans elles, DeepSeek n'écrit pas findings.json ;
      passer --scan-prompt-file <fichier> pour utiliser d'autres consignes
  --verbose
      log bavard : seul son relevé TOKENS permet d'estimer le coût

Toutes les autres options sont transmises telles quelles à codex-security scan (--dry-run,
--mode deep, --path…) ; liste : outils/codex-security/node_modules/.bin/codex-security scan --help

Variables :
  CODEX_TARGET  dépôt à scanner (obligatoire ; cloné par pnpm bootstrap dans cible/copies/<nom>)
  CODEX_CONFIG  configuration (défaut configs/config-defaut.yaml ; scan ciblé : copier config-cible.template.yaml)
  CODEX_OUTPUT  dossier de sortie, vide (défaut resultats/brut/codex-security/scan-<horodatage>)
  LITELLM_PORT  port du proxy (défaut 4000)`;

export async function scan(argv: string[], dependances: Dependances): Promise<number> {
  if (argv.includes("--help") || argv.includes("-h")) {
    for (const ligne of AIDE.split("\n")) dependances.console.affiche(ligne);
    return 0;
  }
  // Toutes les options sont celles de `codex-security scan` : transmises telles quelles.
  const programme = new Command("scan")
    .helpOption(false)
    .allowUnknownOption()
    .allowExcessArguments()
    .argument("[options...]");
  return executeCommande(programme, argv, dependances.console, () =>
    new LanceScan(dependances).execute({ options: programme.args }),
  );
}
