import { type Knex } from 'knex';
import type { UUID } from 'node:crypto';
import type { EntrepotScans } from '../../../scans/entrepotScans.ts';
import type { Scan } from '../../../scans/scan.ts';
import { EntrepotPosgres } from '../../../../../../noyau-partage/src/entrepots/postgres/entrepotPosgres.ts';

type ScanDTO = {
  id: UUID;
  cible: string;
  date_scan: Date;
  rapport: Buffer | null;
};

export class EntrepotScansPostgres
  extends EntrepotPosgres<Scan>
  implements EntrepotScans
{
  constructor(knex: Knex) {
    super(knex, 'scans');
  }

  protected mappe(
    resultat: ScanDTO | Scan
  ): { dto: () => ScanDTO; entite: () => Scan } | undefined {
    if (resultat === undefined) return undefined;
    return {
      dto: () => {
        const scan = resultat as Scan;
        return {
          id: scan.id as UUID,
          cible: scan.cible,
          date_scan: scan.date,
          rapport: scan.rapport ? Buffer.from(scan.rapport) : null,
        };
      },
      entite: () => {
        const scan = resultat as ScanDTO;
        return {
          id: scan.id,
          cible: scan.cible,
          date: scan.date_scan,
          rapport: scan.rapport ? scan.rapport.toString() : undefined,
        };
      },
    };
  }
}
