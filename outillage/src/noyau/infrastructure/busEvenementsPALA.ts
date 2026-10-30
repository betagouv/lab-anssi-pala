import type { Abonne, BusEvenements, Evenement } from '../ports/BusEvenements.ts';

export class BusEvenementsPALA implements BusEvenements {
  readonly #abonnesParNom = new Map<string, Abonne<Evenement>[]>();

  async publie(evenement: Evenement): Promise<void> {
    const abonnes = this.#abonnesParNom.get(evenement.nom) ?? [];
    await Promise.all(abonnes.map((abonne) => abonne(evenement)));
  }

  sabonne<E extends Evenement>(nom: E['nom'], abonne: Abonne<E>): void {
    const abonnes = this.#abonnesParNom.get(nom) ?? [];
    abonnes.push(abonne as Abonne<Evenement>);
    this.#abonnesParNom.set(nom, abonnes);
  }
}
