// Adaptateur de ligne de commande de la validation d'un finding (validate.sh + validate.mjs).
import { resolve } from 'node:path';
import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import { type Dependances, ValideFinding } from '../application/valideFinding.ts';

export type DependancesCli = Dependances & { repertoireAppel: string };

export async function validate(
  argv: string[],
  dependances: DependancesCli
): Promise<number> {
  const programme = new Command('validate')
    .description(
      'Valide un finding existant avec Codex Security (Albert via le proxy LiteLLM).'
    )
    .requiredOption(
      '--finding-file <fichier>',
      'finding à confronter au code (JSON)'
    )
    .requiredOption('--cible <cible>', 'Projet cible à scanner');
  return executeCommande(programme, argv, dependances.console, async () => {
    const { findingFile, cible } = programme.opts<{
      findingFile: string;
      cible: string;
    }>();
    // pnpm exécute depuis la racine : un chemin relatif garde le sens qu'il a pour l'utilisateur.
    await new ValideFinding(dependances).execute({
      findingFile: resolve(dependances.repertoireAppel, findingFile),
      cible,
    });
    return 0;
  });
}
