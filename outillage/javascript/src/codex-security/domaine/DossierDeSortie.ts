import { join } from 'node:path';

const deuxChiffres = (n: number) => String(n).padStart(2, '0');

// Dossier de sortie d'un run Codex Security (scan, validation), vide au démarrage comme l'exige
// Codex. Son log est écrit À CÔTÉ, jamais dedans.
export class DossierDeSortie {
  readonly chemin: string;

  constructor(chemin: string) {
    this.chemin = chemin.replace(/\/+$/, '');
  }

  // resultats/brut/codex-security/<nature>-AAAAMMJJ-HHMMSS (heure locale).
  static horodate(racine: string, nature: string, instant: Date): DossierDeSortie {
    const jour = `${instant.getFullYear()}${deuxChiffres(instant.getMonth() + 1)}${deuxChiffres(instant.getDate())}`;
    const heure = `${deuxChiffres(instant.getHours())}${deuxChiffres(instant.getMinutes())}${deuxChiffres(instant.getSeconds())}`;
    return new DossierDeSortie(
      join(racine, 'resultats/brut/codex-security', `${nature}-${jour}-${heure}`)
    );
  }

  get journal(): string {
    return `${this.chemin}.stdout.log`;
  }
}
