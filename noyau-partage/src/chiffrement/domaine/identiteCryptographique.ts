import type { DocumentChiffre } from './documentChiffre.ts';

export type IdentiteCryptographique = {
  keyId: string;
  clePublique: Uint8Array;
  clePriveeChiffree: DocumentChiffre;
  prf: {
    salt: Uint8Array;
    hkdfSalt: Uint8Array;
    version: number;
  };
};
