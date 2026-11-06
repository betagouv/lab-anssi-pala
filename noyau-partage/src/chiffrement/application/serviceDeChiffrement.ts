import type { Destinataire } from '../domaine/documentPartage.ts';

export interface ServiceDeChiffrement {
  chiffre(
    identifiantScan: string,
    rapport: string,
    destinataires: Destinataire[]
  ): Promise<string>;
}
