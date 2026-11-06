import type { Appareil } from '../enrolement/appareil.ts';
import type { Enveloppe } from '../enrolement/enveloppe.ts';
import type { UUID } from 'node:crypto';

export type Utilisateur = {
  id: UUID;
  nom: string;
  appareil: Appareil;
  enveloppe: Enveloppe;
};
