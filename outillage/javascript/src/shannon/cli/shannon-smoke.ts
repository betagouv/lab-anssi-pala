import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  LancePassageDeFumee,
} from '../application/lancePassageDeFumee.ts';

export async function shannonSmoke(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('shannon-smoke')
    .description(
      'Passage de vérification de Shannon contre une cible locale triviale.'
    )
    .addHelpText(
      'after',
      `
Modèle : SHANNON_AI_MODEL de outils/shannon/shannon.env (obligatoire) ; description pi déduite du fournisseur.
Variables : SMOKE_PORT (défaut 8080), SMOKE_WORKSPACE (défaut : nom unique horodaté),
            SMOKE_REAL=1 (vrais prompts au lieu de --pipeline-testing)`
    );
  return executeCommande(programme, argv, dependances.console, () =>
    new LancePassageDeFumee(dependances).execute()
  );
}
