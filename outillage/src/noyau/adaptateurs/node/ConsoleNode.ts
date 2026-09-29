import type { Console } from "../../ports/Console.ts";

export class ConsoleNode implements Console {
  affiche(ligne: string): void {
    process.stdout.write(`${ligne}\n`);
  }

  ecrit(texte: string): void {
    process.stdout.write(texte);
  }

  signaleErreur(ligne: string): void {
    process.stderr.write(`${ligne}\n`);
  }
}
