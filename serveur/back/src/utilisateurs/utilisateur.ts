import type { Appareil } from '../enrolement/appareil.ts';
import type { Enveloppe } from '../enrolement/enveloppe.ts';

export type Utilisateur = {
  nom: string;
  appareil: Appareil;
  enveloppe: Enveloppe;
};
