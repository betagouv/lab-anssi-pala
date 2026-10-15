import { Command } from 'commander';
import { ErreurUsage, executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  GenereConfigCible,
} from '../application/genereConfigCible.ts';
import { NOM_CIBLE_PAR_DEFAUT } from '../domaine/cheminConfig.ts';
import { NOMBRE_DE_JOURS_PAR_DEFAUT } from '../domaine/fenetreDeModification.ts';

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
      'Nom de la cible : fichier configs/config-<cible>.yaml et copie de travail cible/copies/<cible>',
      NOM_CIBLE_PAR_DEFAUT
    )
    .option(
      '--jours <n>',
      'Fenêtre glissante du git diff délimitant le périmètre, en jours',
      String(NOMBRE_DE_JOURS_PAR_DEFAUT)
    );
  return executeCommande(programme, argv, dependances.console, () => {
    const { cible, jours } = programme.opts<{ cible: string; jours: string }>();
    const nombreDeJours = Number(jours);
    if (!Number.isInteger(nombreDeJours) || nombreDeJours <= 0) {
      throw new ErreurUsage(
        `Erreur : --jours doit être un entier positif (reçu « ${jours} »).`
      );
    }
    new GenereConfigCible(dependances).execute(cible, nombreDeJours);
    return 0;
  });
}
