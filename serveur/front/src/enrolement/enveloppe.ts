import type { IdentiteCryptographique } from 'pala-noyau-partage/src/chiffrement/domaine/identiteCryptographique.ts';
import {
  enBase64,
  octetsDepuisBase64,
} from 'pala-noyau-partage/src/chiffrement/adaptateurs/base64.ts';

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

export const decodeDepuisBase64 = (
  enveloppe: Enveloppe
): IdentiteCryptographique => ({
  keyId: enveloppe.keyId,
  clePublique: octetsDepuisBase64(enveloppe.clePublique),
  clePriveeChiffree: {
    iv: octetsDepuisBase64(enveloppe.clePriveeChiffree.iv),
    ciphertext: octetsDepuisBase64(enveloppe.clePriveeChiffree.ciphertext),
  },
  prf: {
    salt: octetsDepuisBase64(enveloppe.prf.salt),
    hkdfSalt: octetsDepuisBase64(enveloppe.prf.hkdfSalt),
    version: enveloppe.prf.version,
  },
});
