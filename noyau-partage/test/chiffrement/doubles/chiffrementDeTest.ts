import type { ChiffrementSymetrique } from '../../../src/chiffrement/ports/ChiffrementSymetrique.ts';
import type {
  DocumentChiffre,
  Enveloppe,
} from '../../../src/chiffrement/domaine/documentChiffre.ts';
import type { EncapsulationCleDeChiffrement } from '../../../src/chiffrement/ports/EncapsulationCleDeChiffrement.ts';
import type { PaireDeClesAsymetriques } from '../../../src/chiffrement/ports/PaireDeClesAsymetriques.ts';
import type { Destinataire } from '../../../src/chiffrement/domaine/documentPartage.ts';

export const uneCleCryptographiqueDeTest = (): CryptoKey => ({
  algorithm: { name: 'dummy' },
  extractable: false,
  type: 'public',
  usages: [],
});

class ChiffrementSymetriqueDeTest implements ChiffrementSymetrique {
  elementsChiffresRecus: { texte: Uint8Array; cle: CryptoKey; aad?: Uint8Array }[] =
    [];
  elementsADechiffrerRecus: { texte: DocumentChiffre; cle: CryptoKey }[] = [];
  generationDeCle = 0;
  #iv: string;

  constructor({ iv }: { iv: string }) {
    this.#iv = iv;
  }

  async chiffre(
    texte: Uint8Array,
    cle: CryptoKey,
    aad?: Uint8Array
  ): Promise<DocumentChiffre> {
    Uint8Array.from(Buffer.from('toto'));
    this.elementsChiffresRecus.push({ texte, cle, aad });
    const texteEnClair = new TextDecoder().decode(texte);
    return {
      ciphertext: new TextEncoder().encode(`${texteEnClair}-chiffré`),
      iv: Uint8Array.from(Buffer.from(this.#iv)),
    };
  }

  async dechiffre(
    document: DocumentChiffre,
    cle: CryptoKey,
    _aad?: Uint8Array
  ): Promise<Uint8Array> {
    this.elementsADechiffrerRecus.push({ texte: document, cle });
    return new Uint8Array();
  }

  async exporteCle(_cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async genereCle(): Promise<CryptoKey> {
    this.generationDeCle += 1;
    return uneCleCryptographiqueDeTest();
  }

  async importeCle(_octets: Uint8Array): Promise<CryptoKey> {
    return new CryptoKey();
  }
}

class ConstructeurDeChiffrementSymetriqueDeTest {
  #ivDocument: string = 'iv-document';

  construis(): ChiffrementSymetriqueDeTest {
    return new ChiffrementSymetriqueDeTest({ iv: this.#ivDocument });
  }

  avecIVPourLeDocument(
    ivDocument: string
  ): ConstructeurDeChiffrementSymetriqueDeTest {
    this.#ivDocument = ivDocument;
    return this;
  }
}

export const unConstructeurDeChiffrementSymetriqueDeTest =
  (): ConstructeurDeChiffrementSymetriqueDeTest => {
    return new ConstructeurDeChiffrementSymetriqueDeTest();
  };

class EncapsulationDeTest implements EncapsulationCleDeChiffrement {
  #destinataires: Map<string, { enc: string; ciphertext: string }>;

  constructor(destinataires: Map<string, { enc: string; ciphertext: string }>) {
    this.#destinataires = destinataires;
  }

  async open(
    _clePrivee: CryptoKey,
    _enveloppe: Enveloppe,
    _info: string
  ): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async seal(
    clePublique: CryptoKey,
    contenu: Uint8Array,
    info: string
  ): Promise<Enveloppe> {
    const destinataire = this.#destinataires.get(
      info.substring(info.lastIndexOf(':') + 1)
    );
    if (destinataire) {
      return {
        ciphertext: Uint8Array.from(Buffer.from(destinataire.ciphertext)),
        enc: Uint8Array.from(Buffer.from(destinataire.enc)),
      };
    }
    return { ciphertext: new Uint8Array(), enc: new Uint8Array() };
  }
}

class ConstructeurDEncapsulationDeCleDeChiffrementDeTest {
  #destinataires: Map<string, { enc: string; ciphertext: string }> = new Map();
  construis(): EncapsulationDeTest {
    return new EncapsulationDeTest(this.#destinataires);
  }

  retourneUneEnveloppePour(
    destinataire: Destinataire,
    enveloppe: { enc: string; ciphertext: string }
  ): ConstructeurDEncapsulationDeCleDeChiffrementDeTest {
    this.#destinataires.set(destinataire.keyId, enveloppe);
    return this;
  }
}

export const unConstructeurDEncapsulationDeCle =
  (): ConstructeurDEncapsulationDeCleDeChiffrementDeTest => {
    return new ConstructeurDEncapsulationDeCleDeChiffrementDeTest();
  };

export class PaireDeClesDeTest implements PaireDeClesAsymetriques {
  async exportePrivee(_cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async exportePublique(_cle: CryptoKey): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async genere(): Promise<CryptoKeyPair> {
    return {
      privateKey: uneCleCryptographiqueDeTest(),
      publicKey: uneCleCryptographiqueDeTest(),
    };
  }

  async importePrivee(_octets: Uint8Array): Promise<CryptoKey> {
    return uneCleCryptographiqueDeTest();
  }

  async importePublique(_octets: Uint8Array): Promise<CryptoKey> {
    return uneCleCryptographiqueDeTest();
  }
}
