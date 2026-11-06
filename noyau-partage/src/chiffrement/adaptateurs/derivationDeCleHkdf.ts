import type { DerivationDeCle } from '../ports/DerivationDeCle.ts';
import { versArrayBuffer } from './octets.ts';

export class DerivationDeCleHkdf implements DerivationDeCle {
  async deriveKek(
    secretPrf: Uint8Array,
    hkdfSalt: Uint8Array,
    info: string
  ): Promise<CryptoKey> {
    const maitre = await globalThis.crypto.subtle.importKey(
      'raw',
      versArrayBuffer(secretPrf),
      'HKDF',
      false,
      ['deriveKey']
    );

    return globalThis.crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: versArrayBuffer(hkdfSalt),
        info: versArrayBuffer(new TextEncoder().encode(info)),
      },
      maitre,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
}
