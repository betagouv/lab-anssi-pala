import { EntrepotPosgres } from '../../../../../../noyau-partage/src/entrepots/postgres/entrepotPosgres.ts';
import type { Scan } from '../../../partage/scan.ts';
import { type Knex } from 'knex';
import type { UUID } from 'node:crypto';
import type { EntrepotScan } from '../../../../scan/entrepoScan.ts';

type ScanDTO = {
  id: UUID;
  cible: string;
  date_scan: Date;
  premier_commit?: string;
  dernier_commit?: string;
  duree_historique: number;
  fichiers: { liste: string[] };
};

export class EntrepotDeScanPostgres
  extends EntrepotPosgres<Scan>
  implements EntrepotScan
{
  constructor(knex: Knex) {
    super(knex, 'scans');
  }

  async dernierScanPourLaCible(nomCible: string): Promise<Scan> {
    const resultat = await this.knex
      .select()
      .from(this.table)
      .where('cible', nomCible)
      .orderBy('date_scan', 'desc')
      .first();
    return this.mappe(resultat).entite();
  }

  protected mappe(resultat: ScanDTO | Scan): {
    dto: () => ScanDTO;
    entite: () => Scan;
  } {
    return {
      dto: () => {
        const scan = resultat as Scan;
        return {
          id: scan.id,
          cible: scan.cible,
          date_scan: scan.date,
          premier_commit: scan.informationsDeCommits.premierCommit,
          dernier_commit: scan.informationsDeCommits.dernierCommit,
          duree_historique: scan.informationsDeCommits.dureeHistorique,
          fichiers: { liste: scan.informationsDeCommits.fichiers },
        };
      },
      entite: () => {
        const scan = resultat as ScanDTO;
        return {
          id: scan.id,
          cible: scan.cible,
          date: scan.date_scan,
          informationsDeCommits: {
            premierCommit: scan.premier_commit,
            dernierCommit: scan.dernier_commit,
            dureeHistorique: scan.duree_historique,
            fichiers: scan.fichiers.liste,
          },
        };
      },
    };
  }
}
