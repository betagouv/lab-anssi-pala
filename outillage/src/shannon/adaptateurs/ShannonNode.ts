import { join } from "node:path";
import { lanceCommande } from "../../noyau/adaptateurs/node/processus.ts";
import type { DemandeDeLancement, Shannon } from "../ports/Shannon.ts";

// CLI Shannon lancée depuis ses sources (outils/shannon/source) directement avec node, suivie jusqu'au bout.
export class ShannonNode implements Shannon {
  readonly #outil: string;

  constructor(outil: string) {
    this.#outil = outil;
  }

  demarre({ url, depot, config, modelsConfig, workspace, environnement }: DemandeDeLancement): Promise<number> {
    const descriptionPi = modelsConfig ? ["--models-config", modelsConfig] : [];
    return lanceCommande(
      "node",
      ["shannon", "start", "-u", url, "-r", depot, "-c", config, ...descriptionPi, "--follow", "-w", workspace],
      { cwd: join(this.#outil, "source"), env: environnement },
    );
  }
}
