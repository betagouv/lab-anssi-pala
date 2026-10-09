import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import { type Dependances, LanceScan } from '../application/lanceScan.ts';

export async function scan(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command(
    "Lance un scan Codex Security sur la copie de travail de la cible, via le proxy LiteLLM local\n(pnpm start-proxy d'abord), puis en estime le coût.\nToutes les options spécifiques à la CLI de codex-security sont transmises telles quelles"
  )
    .allowUnknownOption()
    .allowExcessArguments()
    .requiredOption('--cible <fichier>', 'Projet cible à scanner')
    .option(
      '--scan-prompt-file <fichier>',
      'Fichier contenant les consignes pour le scan',
      `${dependances.racine}/outils/codex-security/configs/consignes-scan.md`
    )
    .argument('[options...]');
  return executeCommande(programme, argv, dependances.console, () => {
    const { cible, scanPromptFile } = programme.opts<{
      cible: string;
      scanPromptFile: string;
    }>();
    return new LanceScan(dependances).execute({
      options: [...programme.args, '--scan-prompt-file', scanPromptFile],
      cible,
    });
  });
}
