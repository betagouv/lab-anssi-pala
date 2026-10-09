import { type Command, CommanderError } from 'commander';
import type { Console } from './ports/Console.ts';

export class ErreurUsage extends Error {}

const lignes = (texte: string) => texte.replace(/\n$/, '').split('\n');

// Exécute une commande : sorties de commander redirigées vers la Console, puis action métier.
// Codes de sortie, comme les scripts bash/Python : aide 0, erreur d'usage 2, autre erreur 1,
// sinon le code renvoyé par l'action.
export async function executeCommande(
  programme: Command,
  argv: string[],
  maConsole: Console,
  action: () => number | Promise<number>
): Promise<number> {
  programme.exitOverride().configureOutput({
    writeOut: (texte) => lignes(texte).forEach((ligne) => maConsole.aLaLigne(ligne)),
    writeErr: (texte) =>
      lignes(texte).forEach((ligne) => maConsole.signaleErreur(ligne)),
  });
  try {
    await programme.parseAsync(argv, { from: 'user' });
    return await action();
  } catch (erreur) {
    if (erreur instanceof CommanderError) return erreur.exitCode === 0 ? 0 : 2;
    maConsole.signaleErreur(
      erreur instanceof Error ? erreur.message : String(erreur)
    );
    return erreur instanceof ErreurUsage ? 2 : 1;
  }
}
