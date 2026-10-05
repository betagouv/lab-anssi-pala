import type { ServeurCibleFumee } from '../../src/shannon/ports/ServeurCibleFumee.ts';

export class ServeurCibleFumeeSimule implements ServeurCibleFumee {
  readonly #journal: string[];
  enService = false;

  constructor(journal: string[] = []) {
    this.#journal = journal;
  }

  async demarre(port: number): Promise<void> {
    this.enService = true;
    this.#journal.push(`cible servie sur ${port}`);
  }

  async arrete(): Promise<void> {
    this.enService = false;
    this.#journal.push('cible arrêtée');
  }
}
