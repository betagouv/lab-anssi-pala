import type { Evenement } from '../../noyau/ports/BusEvenements.ts';
import type { Cout } from '../../cout/domaine/cout.ts';

export type ResultatDeScan = 'Succès' | 'Échec';

export type ScanTermine = Evenement & {
  readonly nom: 'SCAN_TERMINÉ';
  readonly cible: string;
  readonly resultat: ResultatDeScan;
  readonly cout: Cout;
};

export const unScanTermine = (details: {
  cible: string;
  resultat: ResultatDeScan;
  cout: Cout;
}): ScanTermine => ({ nom: 'SCAN_TERMINÉ', ...details });
