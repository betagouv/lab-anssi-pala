import type { Evenement } from '../../noyau/ports/BusEvenements.ts';
import type { Cout } from '../../cout/domaine/cout.ts';
import type { Constat } from './constat.ts';

export type ResultatDeScan = 'Succès' | 'Échec';

export type ScanTermine = Evenement & {
  readonly nom: 'SCAN_TERMINÉ';
  readonly cible: string;
  readonly resultat: ResultatDeScan;
  readonly cout: Cout;
  readonly constats: Constat[];
  readonly premierCommit?: string;
  readonly dernierCommit?: string;
  readonly nombreDeJours?: number;
};

export const unScanTermine = (details: {
  cible: string;
  resultat: ResultatDeScan;
  cout: Cout;
  constats: Constat[];
  premierCommit?: string;
  dernierCommit?: string;
  nombreDeJours?: number;
}): ScanTermine => ({ nom: 'SCAN_TERMINÉ', ...details });
