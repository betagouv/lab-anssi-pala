import type { UUID } from 'node:crypto';

export type Scan = {
  id: UUID;
  date: Date;
  cible: string;
  informationsDeCommits: {
    premierCommit?: string;
    dernierCommit?: string;
    dureeHistorique: number;
    fichiers: string[];
  };
  rapport?: string;
};
