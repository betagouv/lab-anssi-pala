import type { DocumentChiffre } from '../domaine/documentChiffre.ts';
import type { EnveloppeDestinataire } from '../domaine/documentPartage.ts';
import {
  aadDocument,
  infoEnveloppe,
} from '../domaine/profilEncapsulationChiffrementUtilisateur.ts';
import type { ChiffrementSymetrique } from '../ports/ChiffrementSymetrique.ts';
import type { EncapsulationCleDeChiffrement } from '../ports/EncapsulationCleDeChiffrement.ts';

export type Dependances = {
  chiffrement: ChiffrementSymetrique;
  hpke: EncapsulationCleDeChiffrement;
};

export type CommandeDechiffrement = {
  documentId: string;
  document: DocumentChiffre;
  enveloppe: EnveloppeDestinataire;
  clePrivee: CryptoKey;
};

export class DechiffreDocument {
  readonly #chiffrement: ChiffrementSymetrique;
  readonly #hpke: EncapsulationCleDeChiffrement;

  constructor(dependances: Dependances) {
    this.#chiffrement = dependances.chiffrement;
    this.#hpke = dependances.hpke;
  }

  async execute({
    documentId,
    document,
    enveloppe,
    clePrivee,
  }: CommandeDechiffrement): Promise<Uint8Array> {
    const octetsDek = await this.#hpke.open(
      clePrivee,
      enveloppe,
      infoEnveloppe(documentId, enveloppe.keyId)
    );
    const dek = await this.#chiffrement.importeCle(octetsDek);
    const aad = new TextEncoder().encode(aadDocument(documentId));
    return this.#chiffrement.dechiffre(document, dek, aad);
  }
}
