export type DemandeDeScan = {
  cible: string;
  config: string;
  sortie: string;
  // Fichier où journaliser la sortie du scan (en plus du terminal).
  journal: string;
  options: string[];
  // Environnement complet du processus Codex.
  environnement: Record<string, string | undefined>;
};

// CLI Codex Security publiée sur npm, installée dans outils/codex-security à la version figée par
// package-lock.json.
export interface CliCodexSecurity {
  estInstallee(): boolean;
  installe(): Promise<void>;
  version(): string;
  // Lance `codex-security scan` et renvoie son statut de sortie.
  scanne(demande: DemandeDeScan): Promise<number>;
}
