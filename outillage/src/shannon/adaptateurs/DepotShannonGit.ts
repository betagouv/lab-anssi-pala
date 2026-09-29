import { readdirSync } from "node:fs";
import { join } from "node:path";
import { executeCommande, lanceCommande } from "../../noyau/adaptateurs/node/processus.ts";
import type { DepotShannon } from "../ports/DepotShannon.ts";

// Patchs de outils/shannon/patches, appliqués par git sur le sous-module outils/shannon/source.
// Les patchs sont désignés relativement au dossier de l'outil (« patches/<nom>.patch »).
export class DepotShannonGit implements DepotShannon {
  readonly #outil: string;

  constructor(outil: string) {
    this.#outil = outil;
  }

  patchsLocaux(): string[] {
    return readdirSync(join(this.#outil, "patches"))
      .filter((fichier) => fichier.endsWith(".patch"))
      .sort()
      .map((fichier) => `patches/${fichier}`);
  }

  async patchApplicable(patch: string): Promise<boolean> {
    const code = await lanceCommande("git", ["-C", this.#source, "apply", "--check", join(this.#outil, patch)], {
      silencieux: true,
    });
    return code === 0;
  }

  appliquePatch(patch: string): Promise<void> {
    return executeCommande("git", ["-C", this.#source, "apply", join(this.#outil, patch)]);
  }

  get #source(): string {
    return join(this.#outil, "source");
  }
}
