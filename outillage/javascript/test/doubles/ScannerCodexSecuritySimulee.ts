import type {
  ScannerCodexSecurity,
  DemandeDeScan,
} from '../../src/codex-security/ports/ScannerCodexSecurity.ts';

export class ScannerCodexSecuritySimulee implements ScannerCodexSecurity {
  #installee: boolean;
  readonly #version: string;
  readonly #statutDuScan: number;
  installations = 0;
  readonly scans: DemandeDeScan[] = [];

  constructor({
    installee = true,
    version = '0.1.30',
    statutDuScan = 0,
  }: { installee?: boolean; version?: string; statutDuScan?: number } = {}) {
    this.#installee = installee;
    this.#version = version;
    this.#statutDuScan = statutDuScan;
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

  async scanne(demande: DemandeDeScan): Promise<number> {
    this.scans.push(demande);
    return this.#statutDuScan;
  }
}
