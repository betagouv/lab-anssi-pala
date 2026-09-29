import type { SystemeDeFichier } from "../../src/noyau/ports/SystemeDeFichier.ts";

export class SystemeDeFichierEnMemoire implements SystemeDeFichier {
  readonly fichiers: Map<string, string>;
  readonly dossiers = new Set<string>();

  constructor(fichiers: Record<string, string> = {}) {
    this.fichiers = new Map(Object.entries(fichiers));
  }

  lit(chemin: string): string {
    const contenu = this.fichiers.get(chemin);
    if (contenu === undefined) throw new Error(`Fichier introuvable : ${chemin}`);
    return contenu;
  }

  existe(chemin: string): boolean {
    return this.fichiers.has(chemin) || this.dossiers.has(chemin);
  }

  creeDossier(chemin: string): void {
    const segments = chemin.split("/");
    segments.forEach((_, i) => this.dossiers.add(segments.slice(0, i + 1).join("/")));
  }
}
