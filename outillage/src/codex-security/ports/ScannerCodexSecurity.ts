import type { EnvironnementCodex } from './EnvironnementCodex.ts';

export type DemandeDeScan = {
  cible: string;
  config: string;
  sortie: string;
  journal: string;
  options: string[];
  environnement: EnvironnementCodex;
};

export interface ScannerCodexSecurity {
  estInstallee(): boolean;
  installe(): Promise<void>;
  version(): string;
  scanne(demande: DemandeDeScan): Promise<number>;
}
