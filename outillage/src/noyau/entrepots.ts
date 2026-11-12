import type { EntrepotScan } from '../scan/entrepoScan.ts';
import { environnement } from './environnement.ts';
import { EntrepotDeScanPostgres } from './infrastructure/entrepots/postgres/entrepotDeScanPostgres.ts';
import { knexPALA } from '../../../noyau-partage/src/knex/knexfile.ts';
import { EntrepotDeScanMemoire } from '../../test/noyau/infrastructutre/entrepots/memoire/entrepotScanMemoire.ts';

export type Entrepots = {
  scan: EntrepotScan;
};
export const fabriqueEntrepots = (): Entrepots => {
  if (environnement.baseDeDonnees().active())
    return {
      scan: new EntrepotDeScanPostgres(knexPALA),
    };
  return {
    scan: new EntrepotDeScanMemoire(),
  };
};
