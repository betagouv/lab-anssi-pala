import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  LanceCinematique,
} from '../application/lanceCinematique.ts';

export type DependancesCli = Dependances & { proxyLocal: boolean };

const COMPLEMENT_AIDE = `
Enchaîne toute la cinématique pour une cible : bootstrap (clone) → génère-env → génère-config
→ démarre-proxy (uniquement si le proxy LiteLLM est local) → scan.

Exemple :
  pnpm cinématique --project cible-exemple --url https://github.com/betagouv/cible-exemple.git
  pnpm cinématique --project cible-exemple --url https://github.com/betagouv/cible-exemple.git --branch main --jours 7`;

export const scanComplet = async (
  argv: string[],
  dependances: DependancesCli
): Promise<number> => {
  const programme = new Command('cinématique')
    .description(
      'Lance la cinématique complète, du bootstrap au scan, pour une cible.'
    )
    .requiredOption('--project <nom>', 'nom court de la cible à cloner et scanner')
    .requiredOption('--url <git-url>', 'URL git de la cible à cloner')
    .option(
      '--branch <nom>',
      'branche à cloner (défaut : branche par défaut du dépôt distant)'
    )
    .option(
      '--jours <n>',
      'fenêtre glissante du git diff délimitant le périmètre du scan, en jours'
    )
    .addHelpText('after', COMPLEMENT_AIDE);

  return executeCommande(programme, argv, dependances.console, () => {
    const { project, url, branch, jours } = programme.opts<{
      project: string;
      url: string;
      branch?: string;
      jours?: string;
    }>();
    return new LanceCinematique(dependances).execute({
      cible: { nom: project, url, branche: branch },
      jours: jours === undefined ? undefined : Number(jours),
      proxyLocal: dependances.proxyLocal,
    });
  });
};
