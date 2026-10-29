// Un bus d'événements : on y publie des événements de domaine et on s'abonne par nom d'événement.
export type Evenement = { readonly nom: string };

export type Abonne<E extends Evenement> = (evenement: E) => void;

export interface BusEvenements {
  publie(evenement: Evenement): void;
  sabonne<E extends Evenement>(nom: E['nom'], abonne: Abonne<E>): void;
}
