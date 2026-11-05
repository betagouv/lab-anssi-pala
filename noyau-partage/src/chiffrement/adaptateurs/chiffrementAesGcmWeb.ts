import type { DocumentChiffre } from '../domaine/documentChiffre.ts';
import type { ChiffrementSymetrique } from '../ports/ChiffrementSymetrique.ts';
import { versArrayBuffer } from './octets.ts';

const TAILLE_IV = 12;
const TAILLE_TAG_BITS = 128;

export class ChiffrementAesGcmWeb implements ChiffrementSymetrique {
  async genereCle(): Promise<CryptoKey> {
    return globalThis.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async exporteCle(cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array(await globalThis.crypto.subtle.exportKey('raw', cle));
  }

  async importeCle(octets: Uint8Array): Promise<CryptoKey> {
    return globalThis.crypto.subtle.importKey(
      'raw',
      versArrayBuffer(octets),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  async chiffre(
    contenu: Uint8Array,
    cle: CryptoKey,
    aad?: Uint8Array
  ): Promise<DocumentChiffre> {
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(TAILLE_IV));
    const ciphertext = await globalThis.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: TAILLE_TAG_BITS,
        ...(aad && { additionalData: versArrayBuffer(aad) }),
      },
      cle,
      versArrayBuffer(contenu)
    );
    return { iv, ciphertext: new Uint8Array(ciphertext) };
  }

  async dechiffre(
    document: DocumentChiffre,
    cle: CryptoKey,
    aad?: Uint8Array
  ): Promise<Uint8Array> {
    const contenu = await globalThis.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: versArrayBuffer(document.iv),
        tagLength: TAILLE_TAG_BITS,
        ...(aad && { additionalData: versArrayBuffer(aad) }),
      },
      cle,
      versArrayBuffer(document.ciphertext)
    );
    return new Uint8Array(contenu);
  }
}
