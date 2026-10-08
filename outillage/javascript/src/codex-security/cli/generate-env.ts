// Adaptateur de ligne de commande de la génération de l'environnement du proxy (generate-env.sh).
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
  const programme = new Command('generate-env').description(
    'Génère outils/codex-security/codex-security.env à partir du .env racine (jamais versionné).'
  );
  return executeCommande(programme, argv, dependances.console, () => {
    new GenereEnvironnement(dependances).execute();
    return 0;
  });
}
