import { describe, expect, it } from 'vitest';
import type { IdentiteCryptographique } from 'pala-noyau-partage/src/chiffrement/domaine/identiteCryptographique.ts';
import { encodeEnBase64 } from '../../src/enrolement/enveloppe.ts';

const uneIdentiteCryptographique = (): IdentiteCryptographique => ({
  keyId: 'cle-alice',
  clePublique: new Uint8Array([250, 251, 252, 253]),
  clePriveeChiffree: {
    iv: new Uint8Array([20, 21]),
    ciphertext: new Uint8Array([30, 31]),
  },
  prf: {
    salt: new Uint8Array([40, 41]),
    hkdfSalt: new Uint8Array([50, 51]),
    version: 1,
  },
});

describe('L’enveloppe', () => {
  it('porte les octets de l’identité cryptographique en base64', () => {
    const enveloppe = encodeEnBase64(uneIdentiteCryptographique());

    expect(enveloppe).toStrictEqual({
      keyId: 'cle-alice',
      clePublique: '+vv8/Q==',
      clePriveeChiffree: { iv: 'FBU=', ciphertext: 'Hh8=' },
      prf: { salt: 'KCk=', hkdfSalt: 'MjM=', version: 1 },
    });
  });
});
