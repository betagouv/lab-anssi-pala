import type { ConfigurationProxy, ConteneurProxy } from "../../src/codex-security/ports/ConteneurProxy.ts";

export class ConteneurProxySimule implements ConteneurProxy {
  readonly #journal: string[];
  configuration?: ConfigurationProxy;

  constructor(journal: string[] = []) {
    this.#journal = journal;
  }

  async supprime(): Promise<void> {
    this.#journal.push("conteneur supprimé");
  }

  async demarre(configuration: ConfigurationProxy): Promise<void> {
    this.configuration = configuration;
    this.#journal.push("conteneur démarré");
  }
}
