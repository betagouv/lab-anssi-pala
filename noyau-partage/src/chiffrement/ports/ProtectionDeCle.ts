import type { DocumentChiffre } from '../domaine/documentChiffre.ts';

export interface ProtectionDeCle {
  protege(octetsClePrivee: Uint8Array, kek: CryptoKey): Promise<DocumentChiffre>;
  revele(cleChiffree: DocumentChiffre, kek: CryptoKey): Promise<Uint8Array>;
}
