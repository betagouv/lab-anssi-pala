import {
  aadDocument,
  infoEnveloppe,
} from '../domaine/profilEncapsulationChiffrementUtilisateur.ts';
import type {
  Destinataire,
  DocumentPartage,
  EnveloppeDestinataire,
} from '../domaine/documentPartage.ts';
import type { ChiffrementSymetrique } from '../ports/ChiffrementSymetrique.ts';
import type { PaireDeClesAsymetriques } from '../ports/PaireDeClesAsymetriques.ts';
import type { EncapsulationHpke } from '../adaptateurs/encapsulationHpke.ts';

export type Dependances = {
  chiffrement: ChiffrementSymetrique;
  paire: PaireDeClesAsymetriques;
  hpke: EncapsulationHpke;
};

export type CommandeChiffrement = {
  documentId: string;
  contenu: Uint8Array;
  destinataires: Destinataire[];
};

export class ChiffreDocument {
  readonly #chiffrement: ChiffrementSymetrique;
  readonly #paire: PaireDeClesAsymetriques;
  readonly #hpke: EncapsulationHpke;

  constructor(dependances: Dependances) {
    this.#chiffrement = dependances.chiffrement;
    this.#paire = dependances.paire;
    this.#hpke = dependances.hpke;
  }

  async execute({
    documentId,
    contenu,
    destinataires,
  }: CommandeChiffrement): Promise<DocumentPartage> {
    const dek = await this.#chiffrement.genereCle();
    const aad = new TextEncoder().encode(aadDocument(documentId));
    const document = await this.#chiffrement.chiffre(contenu, dek, aad);

    const octetsDek = await this.#chiffrement.exporteCle(dek);
    const enveloppes = await this.#encapsulePourChaque(
      destinataires,
      octetsDek,
      documentId
    );

    return { documentId, document, enveloppes };
  }

  async #encapsulePourChaque(
    destinataires: Destinataire[],
    octetsDek: Uint8Array,
    documentId: string
  ): Promise<EnveloppeDestinataire[]> {
    return Promise.all(
      destinataires.map(async (destinataire) => {
        const clePublique = await this.#paire.importePublique(
          destinataire.clePublique
        );
        const enveloppe = await this.#hpke.seal(
          clePublique,
          octetsDek,
          infoEnveloppe(documentId, destinataire.keyId)
        );
        return { keyId: destinataire.keyId, ...enveloppe };
      })
    );
  }
}
