import type { Scan } from '../noyau/partage/scan.ts';
import type { Entrepot } from '../../../noyau-partage/src/entrepots/entrepots.ts';

export interface EntrepotScan extends Entrepot<Scan> {
  dernierScanPourLaCible(nomCible: string): Promise<Scan>;
}
