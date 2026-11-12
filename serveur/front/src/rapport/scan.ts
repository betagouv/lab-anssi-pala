import type { Enveloppe } from '../enrolement/enveloppe.ts';

export type Destinataire = {
  identifiantAppareil: string;
  enveloppe: Enveloppe;
};

export type Rapport = {
  documentId: string;
  document: { iv: string; ciphertext: string };
  enveloppes: { keyId: string; enc: string; ciphertext: string }[];
};

export type Scan = {
  id: string;
  cible: string;
  date: string;
  rapport: Rapport;
  destinataires: Destinataire[];
};
