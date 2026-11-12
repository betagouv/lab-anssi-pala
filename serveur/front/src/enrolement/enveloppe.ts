import type { IdentiteCryptographique } from 'pala-noyau-partage/src/chiffrement/domaine/identiteCryptographique.ts';
import { enBase64 } from 'pala-noyau-partage/src/chiffrement/adaptateurs/base64.ts';

export type Enveloppe = {
  keyId: string;
  clePublique: string;
  clePriveeChiffree: { iv: string; ciphertext: string };
  prf: { salt: string; hkdfSalt: string; version: number };
};

export const encodeEnBase64 = (identite: IdentiteCryptographique): Enveloppe => ({
  keyId: identite.keyId,
  clePublique: enBase64(identite.clePublique),
  clePriveeChiffree: {
    iv: enBase64(identite.clePriveeChiffree.iv),
    ciphertext: enBase64(identite.clePriveeChiffree.ciphertext),
  },
  prf: {
    salt: enBase64(identite.prf.salt),
    hkdfSalt: enBase64(identite.prf.hkdfSalt),
    version: identite.prf.version,
  },
});
