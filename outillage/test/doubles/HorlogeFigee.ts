import type { Horloge } from '../../src/noyau/ports/Horloge.ts';

// Horloge arrêtée ; seuls les doubles qui simulent un travail la font avancer.
export class HorlogeFigee implements Horloge {
  #instant: Date;

  constructor(instant: Date) {
    this.#instant = instant;
  }

  maintenant(): Date {
    return new Date(this.#instant);
  }

  avance(millisecondes: number): void {
    this.#instant = new Date(this.#instant.getTime() + millisecondes);
  }
}
