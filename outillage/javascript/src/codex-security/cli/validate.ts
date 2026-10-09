import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import { type Dependances, ValideFinding } from '../application/valideFinding.ts';

export type DependancesCli = Dependances & { repertoireAppel: string };

export async function validate(
  argv: string[],
  dependances: DependancesCli
): Promise<number> {
  const programme = new Command('validate')
    .description('Valide un finding existant avec Codex Security.')
    .requiredOption(
      '--finding-file <fichier>',
      'finding à confronter au code (JSON)'
    )
    .requiredOption('--cible <cible>', 'Projet cible à scanner')
    .option(
      '--config <fichier>',
      'Fichier de config pour l’exécution de la validation',
      `${join(dependances.racine, 'outils/codex-security/configs/config-defaut.yaml')}`
    );
  return executeCommande(programme, argv, dependances.console, async () => {
    const { findingFile, cible, config } = programme.opts<{
      findingFile: string;
      cible: string;
      config: string;
    }>();
    await new ValideFinding(dependances).execute({
      findingFile: resolve(dependances.repertoireAppel, findingFile),
      cible,
      config,
    });
    return 0;
  });
}
