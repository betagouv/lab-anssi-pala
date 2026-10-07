// Adaptateur de ligne de commande de la vérification des appels d'outils (check_tool_calls.py).
import { Command } from 'commander';
import { executeCommande } from '../../noyau/ligne-de-commande.ts';
import {
  type Dependances,
  VerifieAppelsOutils,
} from '../application/verifieAppelsOutils.ts';

export async function checkToolCalls(
  argv: string[],
  dependances: Dependances
): Promise<number> {
  const programme = new Command('check-tool-calls')
    .description(
      'Vérifie que le modèle de Shannon émet de vrais tool_calls structurés, sur plusieurs tours.'
    )
    .option(
      '--model <spec>',
      'modèle vérifié (fournisseur:modèle) ; défaut SHANNON_AI_MODEL'
    )
    .addHelpText(
      'after',
      `
URL et clé : FOURNISSEUR_BASE_URL et FOURNISSEUR_API_KEY (.env racine), clé jamais affichée.
Variables : RUNS (essais, défaut 5), MAX_TOKENS (défaut 4000). Attendu avant tout scan : 5/5 et 5/5.`
    );
  return executeCommande(programme, argv, dependances.console, () => {
    const { model } = programme.opts<{ model?: string }>();
    return new VerifieAppelsOutils(dependances).execute({ modele: model });
  });
}
