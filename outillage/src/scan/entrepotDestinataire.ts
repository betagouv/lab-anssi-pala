import type { Entrepot } from '../../../noyau-partage/src/entrepots/entrepots.js';
import type { Destinataire } from '../../../noyau-partage/src/chiffrement/domaine/documentPartage.js';

export interface EntrepotDestinataire extends Entrepot<Destinataire> {
  tous(): Promise<Destinataire[]>;
}
