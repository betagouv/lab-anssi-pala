import type { SystemeDeFichier } from "../../src/noyau/ports/SystemeDeFichier.ts";

export class SystemeDeFichierEnMemoire implements SystemeDeFichier {
  readonly fichiers: Map<string, string>;

  constructor(fichiers: Record<string, string> = {}) {
    this.fichiers = new Map(Object.entries(fichiers));
  }

  lit(chemin: string): string {
    const contenu = this.fichiers.get(chemin);
    if (contenu === undefined) throw new Error(`Fichier introuvable : ${chemin}`);
    return contenu;
  }
}
