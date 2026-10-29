import type { Evenement } from '../../noyau/ports/BusEvenements.ts';

export type ScanNonEffectue = Evenement & {
  readonly nom: 'SCAN_NON_EFFECTUÉ';
  readonly cible: string;
};

export const unScanNonEffectue = (details: { cible: string }): ScanNonEffectue => ({
  nom: 'SCAN_NON_EFFECTUÉ',
  ...details,
});
