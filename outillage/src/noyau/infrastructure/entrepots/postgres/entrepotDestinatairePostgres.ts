import { EntrepotPosgres } from '../../../../../../noyau-partage/src/entrepots/postgres/entrepotPosgres.ts';
import type { Destinataire } from '../../../../../../noyau-partage/src/chiffrement/domaine/documentPartage.js';
import type { EntrepotDestinataire } from '../../../../scan/entrepotDestinataire.ts';
import type { Knex } from 'knex';

type DestinataireDTO = {
  key_id: string;
  cle_publique: string;
};

export class EntrepotDestinatairePostgres
  extends EntrepotPosgres<Destinataire>
  implements EntrepotDestinataire
{
  constructor(knex: Knex) {
    super(knex, 'utilisateurs');
  }

  async tous(): Promise<Destinataire[]> {
    const { rows }: { rows: DestinataireDTO[] } = await this.knex.raw(
      `SELECT enveloppe ->> 'clePublique' as cle_publique, enveloppe ->> 'keyId' as key_id FROM utilisateurs`
    );
    return rows.map((r) => this.mappe(r).entite());
  }

  protected mappe(resultat: DestinataireDTO | Destinataire): {
    dto: () => unknown;
    entite: () => Destinataire;
  } {
    return {
      dto(): DestinataireDTO {
        const destinataire = resultat as Destinataire;
        return {
          key_id: destinataire.keyId,
          cle_publique: Buffer.from(destinataire.clePublique).toString('base64'),
        };
      },
      entite(): Destinataire {
        const destinataire = resultat as DestinataireDTO;
        return {
          clePublique: new Uint8Array(
            Buffer.from(destinataire.cle_publique, 'base64')
          ),
          keyId: destinataire.key_id,
        };
      },
    };
  }
}
