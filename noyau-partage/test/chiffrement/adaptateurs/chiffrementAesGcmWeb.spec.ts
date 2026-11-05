import { describe, expect, it } from 'vitest';
import { ChiffrementAesGcmWeb } from '../../../src/chiffrement/adaptateurs/chiffrementAesGcmWeb.ts';

const uneCleAes256 = (): Promise<CryptoKey> =>
  globalThis.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);

const octets = (texte: string): Uint8Array => new TextEncoder().encode(texte);

describe('Chiffrement AES-GCM via WebCrypto', () => {
  it('chiffre le contenu ', async () => {
    const chiffrement = new ChiffrementAesGcmWeb();
    const cle = await uneCleAes256();
    const contenu = octets('Un contenu quelconque à protéger.');

    const document = await chiffrement.chiffre(contenu, cle);

    expect(new TextDecoder().decode(document.ciphertext)).not.toBe(
      'Un contenu quelconque à protéger.'
    );
  });

  it('déchiffre et restitue le contenu d’origine', async () => {
    const chiffrement = new ChiffrementAesGcmWeb();
    const cle = await uneCleAes256();
    const contenu = octets('Un contenu quelconque à protéger.');

    const document = await chiffrement.chiffre(contenu, cle);
    const dechiffre = await chiffrement.dechiffre(document, cle);

    expect(new TextDecoder().decode(dechiffre)).toBe(
      'Un contenu quelconque à protéger.'
    );
  });

  it('génère une DEK exportable en 32 octets, réimportable pour déchiffrer', async () => {
    const chiffrement = new ChiffrementAesGcmWeb();

    const dek = await chiffrement.genereCle();
    const octetsDek = await chiffrement.exporteCle(dek);
    expect(octetsDek.length).toBe(32);

    const document = await chiffrement.chiffre(octets('contenu'), dek);
    const reimportee = await chiffrement.importeCle(octetsDek);
    const dechiffre = await chiffrement.dechiffre(document, reimportee);

    expect(new TextDecoder().decode(dechiffre)).toBe('contenu');
  });

  it('refuse de déchiffrer un contenu altéré', async () => {
    const chiffrement = new ChiffrementAesGcmWeb();
    const cle = await uneCleAes256();
    const document = await chiffrement.chiffre(octets('secret'), cle);

    document.ciphertext[0] ^= 0xff;

    await expect(chiffrement.dechiffre(document, cle)).rejects.toThrow();
  });
});
