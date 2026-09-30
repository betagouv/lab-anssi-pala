import type { Horloge } from "../../src/noyau/ports/Horloge.ts";

export class HorlogeFigee implements Horloge {
  readonly #instant: Date;

  constructor(instant: Date) {
    this.#instant = instant;
  }

  maintenant(): Date {
    return new Date(this.#instant);
  }
}
