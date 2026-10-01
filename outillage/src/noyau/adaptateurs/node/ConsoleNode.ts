import type { Writable } from "node:stream";
import {type Console, type Couleur, couleurs} from "../../ports/Console.ts";

const RESET = '\x1b[0m'

type Flux = {
  sortie?: Writable;
  erreurs?: Writable;
  // Réaction quand le lecteur de la sortie ferme le tube (ex. `| head`) : comme les outils Unix,
  // on s'arrête sans erreur.
  auTubeFerme?: () => void;
};

export class ConsoleNode implements Console {
  readonly #sortie: Writable;
  readonly #erreurs: Writable;

  constructor({ sortie = process.stdout, erreurs = process.stderr, auTubeFerme = () => process.exit(0) }: Flux = {}) {
    this.#sortie = sortie;
    this.#erreurs = erreurs;
    this.#sortie.on("error", (erreur: NodeJS.ErrnoException) => {
      if (erreur.code !== "EPIPE") throw erreur;
      auTubeFerme();
    });
  }

  affiche(ligne: string, couleur: Couleur = 'NOIR'): void {
    this.#sortie.write(`${couleurs[couleur]}${ligne}${RESET}\n`);
  }

  ecrit(texte: string, couleur: Couleur = 'NOIR'): void {
    this.#sortie.write(`${couleurs[couleur]}${texte}${RESET}`);
  }

  signaleErreur(ligne: string): void {
    this.#erreurs.write(`${couleurs['ROUGE']}${ligne}${RESET}\n`);
  }

  trace(ligne: string): void {
    this.#erreurs.write(`${couleurs['ROUGE']}${ligne}${RESET}\n`);
  }
}
