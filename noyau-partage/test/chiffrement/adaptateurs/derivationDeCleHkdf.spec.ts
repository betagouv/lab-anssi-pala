import { describe, expect, it } from 'vitest';
import { DerivationDeCleHkdf } from '../../../src/chiffrement/adaptateurs/derivationDeCleHkdf.ts';
import { ChiffrementAesGcmWeb } from '../../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';

const secret = new Uint8Array(32).fill(7);
const sel = new Uint8Array(32).fill(1);

describe('HKDF via WebCrypto', () => {
  it('dérive deux fois la même clé à partir des mêmes entrées', async () => {
    const hkdf = new DerivationDeCleHkdf();
    const aes = new ChiffrementAesGcmWeb();

    const premiere = await hkdf.deriveKek(secret, sel, 'contexte:v1');
    const seconde = await hkdf.deriveKek(secret, sel, 'contexte:v1');

    const document = await aes.chiffre(new TextEncoder().encode('ok'), premiere);
    const dechiffre = await aes.dechiffre(document, seconde);

    expect(new TextDecoder().decode(dechiffre)).toBe('ok');
  });

  it('dérive une clé différente pour un contexte différent', async () => {
    const hkdf = new DerivationDeCleHkdf();
    const aes = new ChiffrementAesGcmWeb();

    const cleA = await hkdf.deriveKek(secret, sel, 'contexte:A');
    const cleB = await hkdf.deriveKek(secret, sel, 'contexte:B');

    const document = await aes.chiffre(new TextEncoder().encode('ok'), cleA);

    await expect(aes.dechiffre(document, cleB)).rejects.toThrow();
  });
});
