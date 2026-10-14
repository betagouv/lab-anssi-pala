import type { Abonne, BusEvenements, Evenement } from '../../ports/BusEvenements.ts';

export class BusEvenementsPALA implements BusEvenements {
  readonly #abonnesParNom = new Map<string, Abonne<Evenement>[]>();

  publie(evenement: Evenement): void {
    for (const abonne of this.#abonnesParNom.get(evenement.nom) ?? []) {
      abonne(evenement);
    }
  }

  sabonne<E extends Evenement>(nom: E['nom'], abonne: Abonne<E>): void {
    const abonnes = this.#abonnesParNom.get(nom) ?? [];
    abonnes.push(abonne as Abonne<Evenement>);
    this.#abonnesParNom.set(nom, abonnes);
  }
}
