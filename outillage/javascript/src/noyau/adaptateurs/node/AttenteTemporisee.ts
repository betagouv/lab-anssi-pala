import { setTimeout } from 'node:timers/promises';
import type { Attente } from '../../ports/Attente.ts';

export class AttenteTemporisee implements Attente {
  async attends(millisecondes: number): Promise<void> {
    await setTimeout(millisecondes);
  }
}
