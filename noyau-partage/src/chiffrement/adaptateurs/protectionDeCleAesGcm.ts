import type { DocumentChiffre } from '../domaine/documentChiffre.ts';
import type { ChiffrementSymetrique } from '../ports/ChiffrementSymetrique.ts';
import type { ProtectionDeCle } from '../ports/ProtectionDeCle.ts';
import { ChiffrementAesGcmWeb } from './chiffrementAesGcmWeb.ts';

export class ProtectionDeCleAesGcm implements ProtectionDeCle {
  readonly #chiffrement: ChiffrementSymetrique;

  constructor(chiffrement: ChiffrementSymetrique = new ChiffrementAesGcmWeb()) {
    this.#chiffrement = chiffrement;
  }

  async protege(
    octetsClePrivee: Uint8Array,
    kek: CryptoKey
  ): Promise<DocumentChiffre> {
    return this.#chiffrement.chiffre(octetsClePrivee, kek);
  }

  async revele(cleChiffree: DocumentChiffre, kek: CryptoKey): Promise<Uint8Array> {
    return this.#chiffrement.dechiffre(cleChiffree, kek);
  }
}
