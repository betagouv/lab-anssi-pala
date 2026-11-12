import type { EntrepotScan } from '../scan/entrepoScan.ts';
import { environnement } from './environnement.ts';
import { EntrepotDeScanPostgres } from './infrastructure/entrepots/postgres/entrepotDeScanPostgres.ts';
import { knexPALA } from '../../../noyau-partage/src/knex/knexfile.ts';
import {
  EntrepotDeScanMemoire,
  EntrepotDestinataireMemoire,
} from '../../test/noyau/infrastructutre/entrepots/memoire/entrepotsMemoire.ts';
import type { EntrepotDestinataire } from '../scan/entrepotDestinataire.ts';

export type Entrepots = {
  scan: EntrepotScan;
  destinataire: EntrepotDestinataire;
};
export const fabriqueEntrepots = (): Entrepots => {
  if (environnement.baseDeDonnees().active())
    return {
      scan: new EntrepotDeScanPostgres(knexPALA),
      destinataire: new EntrepotDestinataireMemoire(),
    };
  return {
    scan: new EntrepotDeScanMemoire(),
    destinataire: new EntrepotDestinataireMemoire(),
  };
};
