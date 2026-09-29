import { type Command, CommanderError } from "commander";
import type { Console } from "./ports/Console.ts";

// Erreur d'utilisation détectée après l'analyse des options (combinaison invalide…).
export class ErreurUsage extends Error {}

const lignes = (texte: string) => texte.replace(/\n$/, "").split("\n");

// Exécute une commande : sorties de commander redirigées vers la Console, puis action métier.
// Codes de sortie, comme les scripts bash/Python : aide 0, erreur d'usage 2, autre erreur 1,
// sinon le code renvoyé par l'action.
export async function executeCommande(
  programme: Command,
  argv: string[],
  console: Console,
  action: () => number | Promise<number>,
): Promise<number> {
  programme.exitOverride().configureOutput({
    writeOut: (texte) => lignes(texte).forEach((ligne) => console.affiche(ligne)),
    writeErr: (texte) => lignes(texte).forEach((ligne) => console.signaleErreur(ligne)),
  });
  try {
    await programme.parseAsync(argv, { from: "user" });
    return await action();
  } catch (erreur) {
    if (erreur instanceof CommanderError) return erreur.exitCode === 0 ? 0 : 2;
    console.signaleErreur(erreur instanceof Error ? erreur.message : String(erreur));
    return erreur instanceof ErreurUsage ? 2 : 1;
  }
}
