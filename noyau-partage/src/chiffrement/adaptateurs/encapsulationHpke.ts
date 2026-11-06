import type { CipherSuite } from '@hpke/core';
import type { Enveloppe } from '../domaine/documentChiffre.ts';
import type { EncapsulationCleDeChiffrement } from '../ports/EncapsulationCleDeChiffrement.ts';
import { versArrayBuffer } from './octets.ts';
import { creeSuiteDeChiffrementHpke } from './suiteDeChiffrementHpke.ts';

export class EncapsulationHpke implements EncapsulationCleDeChiffrement {
  readonly #suite: CipherSuite;

  constructor(suite: CipherSuite = creeSuiteDeChiffrementHpke()) {
    this.#suite = suite;
  }

  async seal(
    clePublique: CryptoKey,
    contenu: Uint8Array,
    info: string
  ): Promise<Enveloppe> {
    const { enc, ct } = await this.#suite.seal(
      {
        recipientPublicKey: clePublique,
        info: new TextEncoder().encode(info),
      },
      versArrayBuffer(contenu)
    );
    return { enc: new Uint8Array(enc), ciphertext: new Uint8Array(ct) };
  }

  async open(
    clePrivee: CryptoKey,
    enveloppe: Enveloppe,
    info: string
  ): Promise<Uint8Array> {
    const contenu = await this.#suite.open(
      {
        recipientKey: clePrivee,
        enc: versArrayBuffer(enveloppe.enc),
        info: new TextEncoder().encode(info),
      },
      versArrayBuffer(enveloppe.ciphertext)
    );
    return new Uint8Array(contenu);
  }
}
