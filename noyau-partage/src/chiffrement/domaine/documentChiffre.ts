export type DocumentChiffre = {
  iv: Uint8Array;
  ciphertext: Uint8Array;
};

export type Enveloppe = {
  enc: Uint8Array;
  ciphertext: Uint8Array;
};
