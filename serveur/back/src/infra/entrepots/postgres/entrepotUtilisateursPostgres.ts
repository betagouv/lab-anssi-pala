import type { EntrepotUtilisateurs } from '../../../utilisateurs/entrepotUtilisateurs.ts';
import type { Utilisateur } from '../../../utilisateurs/utilisateur.ts';
import { EntrepotPosgres } from '../../../../../../noyau-partage/src/entrepots/postgres/entrepotPosgres.ts';
import type { Knex } from 'knex';
import type { UUID } from 'node:crypto';
import type { Appareil } from '../../../enrolement/appareil.ts';
import type { Enveloppe } from '../../../enrolement/enveloppe.ts';

type AppareilDTO = Appareil;
type EnveloppeDTO = Enveloppe;

type UtilisateurDTO = {
  id: UUID;
  nom: string;
  appareil: AppareilDTO;
  enveloppe: EnveloppeDTO;
};

export class EntrepotUtilisateursPostgres
  extends EntrepotPosgres<Utilisateur>
  implements EntrepotUtilisateurs
{
  constructor(knex: Knex) {
    super(knex, 'utilisateurs');
  }

  async parKeyIds(keyIds: string[]): Promise<Utilisateur[]> {
    const resultats: UtilisateurDTO[] = await this.knex
      .select()
      .from(this.table)
      .whereRaw(`enveloppe ->> 'keyId' = ANY(?)`, [keyIds]);
    return resultats.map((resultat) => this.mappe(resultat).entite());
  }

  protected mappe(utilisateur: UtilisateurDTO | Utilisateur): {
    dto: () => unknown;
    entite: () => Utilisateur;
  } {
    return {
      dto(): UtilisateurDTO {
        const resultat = utilisateur as Utilisateur;
        return {
          id: resultat.id,
          nom: resultat.nom,
          appareil: resultat.appareil,
          enveloppe: resultat.enveloppe,
        };
      },
      entite(): Utilisateur {
        const resultat = utilisateur as UtilisateurDTO;
        return {
          id: resultat.id,
          nom: resultat.nom,
          appareil: resultat.appareil,
          enveloppe: resultat.enveloppe,
        };
      },
    };
  }
}
