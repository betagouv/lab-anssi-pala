import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { DemandeDeValidation, ResultatDeValidation, ValidationCodex } from "../ports/ValidationCodex.ts";

// Surface du SDK @openai/codex-security utilisée ici.
type Sdk = {
  loadProjectConfig(fichier: string): Promise<{ config: unknown }>;
  CodexSecurity: new (config: unknown) => SecuriteCodex;
};
type SecuriteCodex = {
  validate(options: { repositoryPath: string; finding: object; outputDir: string; auth: "api-key" }): Promise<{
    disposition: string;
    threadId: string | null;
    outputDir: string;
    report: string;
  }>;
  close(): Promise<void>;
};

// Pourquoi le SDK plutôt que `codex-security validate` : la CLI lance Codex avec
// --ignore-user-config ; la méthode validate() du SDK applique la section codex de la config
// projet (fournisseur Albert via le proxy).
export class ValidationCodexSdk implements ValidationCodex {
  readonly #outil: string;
  #securite?: SecuriteCodex;

  constructor(outil: string) {
    this.#outil = outil;
  }

  async valide({ cible, config, finding, sortie, environnement }: DemandeDeValidation): Promise<ResultatDeValidation> {
    // Le SDK tourne dans ce processus et y lit jeton local et identité Codex isolée.
    delete process.env.OPENAI_API_KEY;
    Object.assign(process.env, environnement);
    const sdk: Sdk = await import(
      pathToFileURL(join(this.#outil, "node_modules/@openai/codex-security/dist/index.js")).href
    );
    const { config: configuration } = await sdk.loadProjectConfig(config);
    this.#securite = new sdk.CodexSecurity(configuration);
    const resultat = await this.#securite.validate({ repositoryPath: cible, finding, outputDir: sortie, auth: "api-key" });
    return {
      disposition: resultat.disposition,
      threadId: resultat.threadId,
      dossier: resultat.outputDir,
      rapport: resultat.report,
    };
  }

  async ferme(): Promise<void> {
    await this.#securite?.close();
  }
}
