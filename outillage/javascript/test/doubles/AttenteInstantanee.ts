import type { Attente } from '../../src/noyau/ports/Attente.ts';

// Ne fait pas attendre : consigne seulement les durées demandées.
export class AttenteInstantanee implements Attente {
  readonly attentes: number[] = [];

  async attends(millisecondes: number): Promise<void> {
    this.attentes.push(millisecondes);
  }
}
