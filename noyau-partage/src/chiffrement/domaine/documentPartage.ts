import type { DocumentChiffre, Enveloppe } from './documentChiffre.ts';

export type Destinataire = {
  keyId: string;
  clePublique: Uint8Array;
};

export type EnveloppeDestinataire = Enveloppe & {
  keyId: string;
};

export type DocumentPartage = {
  documentId: string;
  document: DocumentChiffre;
  enveloppes: EnveloppeDestinataire[];
};
