import type { Enveloppe } from '../domaine/documentChiffre.ts';

export interface EncapsulationCleDeChiffrement {
  seal(
    clePublique: CryptoKey,
    contenu: Uint8Array,
    info: string
  ): Promise<Enveloppe>;
  open(
    clePrivee: CryptoKey,
    enveloppe: Enveloppe,
    info: string
  ): Promise<Uint8Array>;
}
