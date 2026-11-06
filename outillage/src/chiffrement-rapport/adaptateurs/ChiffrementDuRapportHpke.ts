import type { ChiffrementDuRapport } from '../ports/ChiffrementDuRapport.ts';
import type { ChiffreDocument } from '../../../../noyau-partage/src/chiffrement/application/ChiffreDocument.ts';
import type { Destinataire } from '../../../../noyau-partage/src/chiffrement/domaine/documentPartage.ts';
import { documentPartageVersJson } from './documentPartageJson.ts';

export type Dependances = {
  chiffreDocument: ChiffreDocument;
  destinataires: Destinataire[];
};

export class ChiffrementDuRapportHpke implements ChiffrementDuRapport {
  readonly #chiffreDocument: ChiffreDocument;
  readonly #destinataires: Destinataire[];

  constructor(dependances: Dependances) {
    this.#chiffreDocument = dependances.chiffreDocument;
    this.#destinataires = dependances.destinataires;
  }

  async chiffre(identifiantScan: string, rapport: string): Promise<string> {
    const partage = await this.#chiffreDocument.execute({
      documentId: identifiantScan,
      contenu: new TextEncoder().encode(rapport),
      destinataires: this.#destinataires,
    });
    return documentPartageVersJson(partage);
  }
}
