import type { Destinataire } from '../domaine/documentPartage.ts';

export interface ServiceDeChiffrement {
  chiffre(
    identifiantDocument: string,
    contenu: string,
    destinataires: Destinataire[]
  ): Promise<string>;
}
