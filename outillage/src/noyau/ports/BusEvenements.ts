export type Evenement = { readonly nom: string };

export type Abonne<E extends Evenement> = (evenement: E) => void | Promise<void>;

export interface BusEvenements {
  publie(evenement: Evenement): Promise<void>;
  sabonne<E extends Evenement>(nom: E['nom'], abonne: Abonne<E>): void;
}
