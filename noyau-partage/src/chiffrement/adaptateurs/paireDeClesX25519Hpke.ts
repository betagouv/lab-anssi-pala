import type { CipherSuite } from '@hpke/core';
import type { PaireDeClesAsymetriques } from '../ports/PaireDeClesAsymetriques.ts';
import { creeSuiteDeChiffrementHpke } from './suiteDeChiffrementHpke.ts';
import { versArrayBuffer } from './octets.ts';

export class PaireDeClesX25519Hpke implements PaireDeClesAsymetriques {
  readonly #suite: CipherSuite;

  constructor(suite: CipherSuite = creeSuiteDeChiffrementHpke()) {
    this.#suite = suite;
  }

  async genere(): Promise<CryptoKeyPair> {
    return this.#suite.kem.generateKeyPair();
  }

  async exportePublique(cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array(await this.#suite.kem.serializePublicKey(cle));
  }

  async exportePrivee(cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array(await this.#suite.kem.serializePrivateKey(cle));
  }

  async importePublique(octets: Uint8Array): Promise<CryptoKey> {
    return this.#suite.kem.deserializePublicKey(versArrayBuffer(octets));
  }

  async importePrivee(octets: Uint8Array): Promise<CryptoKey> {
    return this.#suite.kem.deserializePrivateKey(versArrayBuffer(octets));
  }
}
