import type { ChiffrementDuRapport } from '../../src/chiffrement-rapport/ports/ChiffrementDuRapport.ts';

export class ChiffrementDuRapportSimule implements ChiffrementDuRapport {
  readonly rapportsRecus: { identifiantScan: string; rapport: string }[] = [];

  async chiffre(identifiantScan: string, rapport: string): Promise<string> {
    this.rapportsRecus.push({ identifiantScan, rapport });
    return `rapport chiffré du scan ${identifiantScan}`;
  }
}
