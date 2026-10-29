import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  GenereEnvironnement,
} from '../application/genereEnvironnement.ts';

export async function genereEnv(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('génère-env').description(
    'Génère outils/shannon/shannon.env à partir du .env racine (jamais versionné).'
  );
  return executeCommande(programme, argv, dependances.console, () => {
    new GenereEnvironnement(dependances).execute();
    return 0;
  });
}
