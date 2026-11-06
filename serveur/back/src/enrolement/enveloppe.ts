export type Enveloppe = {
  keyId: string;
  clePublique: string;
  clePriveeChiffree: { iv: string; ciphertext: string };
  prf: { salt: string; hkdfSalt: string; version: number };
};
