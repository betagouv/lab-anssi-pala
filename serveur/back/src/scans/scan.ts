import type { UUID } from 'node:crypto';

export type Scan = {
  id: UUID;
  cible: string;
  date: Date;
  rapport?: string;
};
