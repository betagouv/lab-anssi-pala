import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  GenereConfigCible,
} from '../application/genereConfigCible.ts';
import { NOM_CIBLE_PAR_DEFAUT } from '../domaine/cheminConfig.ts';

export async function genereConfig(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('génère-config')
    .description(
      'Génère la config Codex Security ciblée (configs/config-<cible>.yaml) à partir du .env racine.'
    )
    .option(
      '--cible <nom>',
      'Nom de la cible : donne son fichier configs/config-<cible>.yaml',
      NOM_CIBLE_PAR_DEFAUT
    );
  return executeCommande(programme, argv, dependances.console, () => {
    const { cible } = programme.opts<{ cible: string }>();
    new GenereConfigCible(dependances).execute(cible);
    return 0;
  });
}
