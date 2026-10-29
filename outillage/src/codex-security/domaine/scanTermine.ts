import type { Evenement } from '../../noyau/ports/BusEvenements.ts';
import type { Cout } from '../../cout/domaine/cout.ts';
import type { Constat } from './constat.ts';
import type { InformationsDeCommits } from './informationsDeCommits.ts';

export type ResultatDeScan = 'Succès' | 'Échec';

export type ScanTermine = Evenement & {
  readonly nom: 'SCAN_TERMINÉ';
  readonly cible: string;
  readonly resultat: ResultatDeScan;
  readonly cout: Cout;
  readonly constats: Constat[];
  readonly informationsDeCommits?: InformationsDeCommits;
  readonly nombreDeFichiers?: number;
  readonly dureeEnMs?: number;
};

export const unScanTermine = (details: {
  cible: string;
  resultat: ResultatDeScan;
  cout: Cout;
  constats: Constat[];
  informationsDeCommits?: InformationsDeCommits;
  nombreDeFichiers?: number;
  dureeEnMs?: number;
}): ScanTermine => ({ nom: 'SCAN_TERMINÉ', ...details });
