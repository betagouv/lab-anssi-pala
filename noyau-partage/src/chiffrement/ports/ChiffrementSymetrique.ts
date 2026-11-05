import type { DocumentChiffre } from '../domaine/documentChiffre.ts';

export interface ChiffrementSymetrique {
  genereCle(): Promise<CryptoKey>;
  exporteCle(cle: CryptoKey): Promise<Uint8Array>;
  importeCle(octets: Uint8Array): Promise<CryptoKey>;
  chiffre(
    contenu: Uint8Array,
    cle: CryptoKey,
    aad?: Uint8Array
  ): Promise<DocumentChiffre>;
  dechiffre(
    document: DocumentChiffre,
    cle: CryptoKey,
    aad?: Uint8Array
  ): Promise<Uint8Array>;
}
