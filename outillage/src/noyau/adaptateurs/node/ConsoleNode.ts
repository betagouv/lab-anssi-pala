import {type Console, type Couleur, couleurs} from "../../ports/Console.ts";

const RESET = '\x1b[0m'

export class ConsoleNode implements Console {
  affiche(ligne: string, couleur: Couleur = 'NOIR'): void {
    process.stdout.write(`${couleurs[couleur]}${ligne}${RESET}\n`);
  }

  ecrit(texte: string): void {
    process.stdout.write(texte);
  }

  signaleErreur(ligne: string): void {
    process.stderr.write(`${ligne}\n`);
  }

  trace(ligne: string): void {
    process.stderr.write(`${ligne}\n`);
  }
}
