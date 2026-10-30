import type { Scan } from '../../../../../src/noyau/partage/scan.ts';
import type { Entrepot } from '../../../../../../noyau-partage/src/entrepots/entrepots.ts';
import type { EntrepotScan } from '../../../../../src/scan/entrepoScan.ts';

class EntrepotMemoire<T> implements Entrepot<T> {
  tousLesElements: T[] = [];

  async persiste(element: T): Promise<void> {
    this.tousLesElements.push(element);
  }

  async lis(identifiant: string): Promise<T> {
    const elementsTrouves = this.tousLesElements.filter(
      (element) => identifiant in (element as object)
    );
    if (elementsTrouves.length === 0)
      throw new Error(`Aucun élément trouvé avec l'identifiant ${identifiant}`);
    return elementsTrouves[0];
  }
}

export class EntrepotDeScanMemoire
  extends EntrepotMemoire<Scan>
  implements EntrepotScan
{
  async dernierScanPourLaCible(nomCible: string): Promise<Scan> {
    const scans = this.tousLesElements.filter((s) => nomCible === s.cible);
    return scans.length > 1 ? scans[scans.length - 1] : scans[0];
  }
}
