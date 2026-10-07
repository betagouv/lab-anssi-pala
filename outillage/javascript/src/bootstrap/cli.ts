// Adaptateur de ligne de commande du bootstrap (équivalent de scripts/bootstrap.sh).
import { Command } from 'commander';
import { ErreurUsage, executeCommande } from '../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  PrepareEnvironnement,
} from './application/prepareEnvironnement.ts';
import { Cible } from './domaine/Cible.ts';

type Options = { project?: string; url?: string; branch?: string };

const COMPLEMENT_AIDE = `
Sans --project/--url, le bootstrap se limite aux sous-modules des outils et à leur préparation
(utile pour réinitialiser l'outillage sans (re)cloner de cible).

Exemples :
  pnpm bootstrap --project cible-exemple --url https://github.com/betagouv/cible-exemple.git
  pnpm bootstrap --project cible-exemple --url https://github.com/betagouv/cible-exemple.git --branch main

Après le bootstrap, les outils ciblent la copie cible/copies/<nom> (rappel en fin d'exécution) :
CIBLE pour Codex Security ; pour Shannon, pnpm shannon --project <nom> l'utilise par défaut.`;

export async function bootstrap(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('bootstrap')
    .description(
      "Prépare l'environnement d'audit (sous-modules des outils, clone de la cible, outils)."
    )
    .option(
      '--project <nom>',
      'nom court de la cible ; la copie de travail est cible/copies/<nom>'
    )
    .option('--url <git-url>', 'URL git de la cible à cloner')
    .option(
      '--branch <nom>',
      'branche à cloner (défaut : branche par défaut du dépôt distant)'
    )
    .addHelpText('after', COMPLEMENT_AIDE);

  return executeCommande(programme, argv, dependances.console, async () => {
    const { project, url, branch } = programme.opts<Options>();
    // --project et --url vont de pair : soit les deux, soit aucun.
    if (project && !url)
      throw new ErreurUsage('Erreur : --project fourni sans --url.');
    if (url && !project)
      throw new ErreurUsage('Erreur : --url fourni sans --project.');
    const cible =
      project && url ? new Cible({ nom: project, url, branche: branch }) : undefined;
    await new PrepareEnvironnement(dependances).execute({ cible });
    return 0;
  });
}
