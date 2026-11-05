import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  GenereConfigurationProxy,
} from '../application/genereConfigurationProxy.ts';

export async function genereConfigProxy(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('génère-config-proxy').description(
    'Génère la config du proxy LiteLLM (litellm/config-genere.yaml) à partir du .env racine.'
  );
  return executeCommande(programme, argv, dependances.console, async () => {
    await new GenereConfigurationProxy(dependances).execute();
    return 0;
  });
}
