import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import { DemarreProxy, type Dependances } from '../application/demarreProxy.ts';
import { environnement } from '../../noyau/environnement.ts';

export const demarreProxy = async (
  argv: string[],
  dependances: Dependances
): Promise<number> => {
  const url = environnement.urlLiteLLMConfiguree();
  const programme = new Command('démarre-proxy')
    .description(`Lance (ou relance) le proxy LiteLLM sur ${url}.`)
    .addHelpText(
      'after',
      `
Arrêt : docker rm -f codex-security-litellm
Budget : plafond de litellm/config.yaml appliqué seulement si LITELLM_DATABASE_URL (Postgres) est
fournie ; sinon le coût est suivi sans être bloqué (voir le README).`
    );
  return executeCommande(programme, argv, dependances.console, async () => {
    await new DemarreProxy(dependances).execute();
    return 0;
  });
};
