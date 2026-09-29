// CLI Codex Security publiée sur npm, installée dans outils/codex-security à la version figée par
// package-lock.json.
export interface CliCodexSecurity {
  estInstallee(): boolean;
  installe(): Promise<void>;
  version(): string;
}
