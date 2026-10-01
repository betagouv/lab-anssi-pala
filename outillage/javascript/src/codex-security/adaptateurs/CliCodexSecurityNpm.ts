import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { executeCommande, lanceCommande } from "../../noyau/adaptateurs/node/processus.ts";
import type { CliCodexSecurity, DemandeDeScan } from "../ports/CliCodexSecurity.ts";

// CLI installée par npm dans outils/codex-security/node_modules (version figée par package-lock.json).
export class CliCodexSecurityNpm implements CliCodexSecurity {
  readonly #outil: string;
  readonly #repertoireAppel: string;

  // repertoireAppel : les chemins relatifs des options (--scan-prompt-file…) s'entendent depuis là.
  constructor(outil: string, repertoireAppel = process.cwd()) {
    this.#outil = outil;
    this.#repertoireAppel = repertoireAppel;
  }

  get #executable(): string {
    return join(this.#outil, "node_modules/.bin/codex-security");
  }

  estInstallee(): boolean {
    return existsSync(this.#executable);
  }

  installe(): Promise<void> {
    return executeCommande("npm", ["ci", "--no-fund", "--no-audit"], { cwd: this.#outil });
  }

  version(): string {
    return execFileSync(this.#executable, ["--version"], { encoding: "utf8" }).trim();
  }

  scanne({ cible, config, sortie, journal, options, environnement }: DemandeDeScan): Promise<number> {
    return lanceCommande(
      this.#executable,
      ["scan", cible, "-c", config, "--output-dir", sortie, "--headless", ...options],
      { cwd: this.#repertoireAppel, env: environnement, journal },
    );
  }
}
