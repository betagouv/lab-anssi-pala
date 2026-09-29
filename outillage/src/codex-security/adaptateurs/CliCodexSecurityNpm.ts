import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { executeCommande } from "../../noyau/adaptateurs/node/processus.ts";
import type { CliCodexSecurity } from "../ports/CliCodexSecurity.ts";

// CLI installée par npm dans outils/codex-security/node_modules (version figée par package-lock.json).
export class CliCodexSecurityNpm implements CliCodexSecurity {
  readonly #outil: string;

  constructor(outil: string) {
    this.#outil = outil;
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
}
