import type { ServiceDeChiffrement } from './serviceDeChiffrement.ts';
import type {
  Destinataire,
  DocumentPartage,
  EnveloppeDestinataire,
} from '../domaine/documentPartage.ts';
import type { ChiffrementSymetrique } from '../ports/ChiffrementSymetrique.ts';
import type { PaireDeClesAsymetriques } from '../ports/PaireDeClesAsymetriques.ts';
import type { EncapsulationCleDeChiffrement } from '../ports/EncapsulationCleDeChiffrement.ts';
import {
  aadDocument,
  infoEnveloppe,
} from '../domaine/profilEncapsulationChiffrementUtilisateur.ts';

export type ConfigurationChiffrement = {
  chiffrement: ChiffrementSymetrique;
  paireDeClesAsymetriques: PaireDeClesAsymetriques;
  encapsulationCleDeChiffrement: EncapsulationCleDeChiffrement;
};

export class ServiceDeChiffrementParEnveloppe implements ServiceDeChiffrement {
  readonly configurationChiffrement: ConfigurationChiffrement;

  constructor(configurationChiffrement: ConfigurationChiffrement) {
    this.configurationChiffrement = configurationChiffrement;
  }

  async chiffre(
    identifiantDeContenu: string,
    contenu: string,
    destinataires: Destinataire[]
  ): Promise<string> {
    const dek = await this.configurationChiffrement.chiffrement.genereCle();
    const aad = new TextEncoder().encode(aadDocument(identifiantDeContenu));
    const document = await this.configurationChiffrement.chiffrement.chiffre(
      new TextEncoder().encode(contenu),
      dek,
      aad
    );

    const octetsDek =
      await this.configurationChiffrement.chiffrement.exporteCle(dek);
    const enveloppes = await this.#encapsulePourChaque(
      destinataires,
      octetsDek,
      identifiantDeContenu
    );

    return this.#encodeEnJson({
      documentId: identifiantDeContenu,
      document,
      enveloppes,
    });
  }

  async #encapsulePourChaque(
    destinataires: Destinataire[],
    octetsDek: Uint8Array,
    documentId: string
  ): Promise<EnveloppeDestinataire[]> {
    return Promise.all(
      destinataires.map(async (destinataire) => {
        const clePublique =
          await this.configurationChiffrement.paireDeClesAsymetriques.importePublique(
            destinataire.clePublique
          );
        const enveloppe =
          await this.configurationChiffrement.encapsulationCleDeChiffrement.seal(
            clePublique,
            octetsDek,
            infoEnveloppe(documentId, destinataire.keyId)
          );
        return { keyId: destinataire.keyId, ...enveloppe };
      })
    );
  }

  #encodeEnJson(partage: DocumentPartage): string {
    type OctetsEnBase64Url = string;

    const enBase64Url = (octets: Uint8Array): OctetsEnBase64Url =>
      Buffer.from(octets).toString('base64url');

    const json = {
      documentId: partage.documentId,
      document: {
        iv: enBase64Url(partage.document.iv),
        ciphertext: enBase64Url(partage.document.ciphertext),
      },
      enveloppes: partage.enveloppes.map((enveloppe) => ({
        keyId: enveloppe.keyId,
        enc: enBase64Url(enveloppe.enc),
        ciphertext: enBase64Url(enveloppe.ciphertext),
      })),
    };
    return JSON.stringify(json);
  }
}
