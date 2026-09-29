import type { CliCodexSecurity } from "../../src/codex-security/ports/CliCodexSecurity.ts";

export class CliCodexSecuritySimulee implements CliCodexSecurity {
  #installee: boolean;
  readonly #version: string;
  installations = 0;

  constructor({ installee = true, version = "0.1.30" }: { installee?: boolean; version?: string } = {}) {
    this.#installee = installee;
    this.#version = version;
  }

  estInstallee(): boolean {
    return this.#installee;
  }

  async installe(): Promise<void> {
    this.installations++;
    this.#installee = true;
  }

  version(): string {
    return this.#version;
  }
}
