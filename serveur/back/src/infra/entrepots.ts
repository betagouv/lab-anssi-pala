import type { EntrepotScans } from '../scans/entrepotScans.ts';
import type { EntrepotUtilisateurs } from '../utilisateurs/entrepotUtilisateurs.ts';
import { adaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.ts';
import { EntrepotUtilisateursEnMemoire } from '../../test/infra/entrepots/memoire/entrepotUtilisateursEnMemoire.ts';
import { EntrepotScansEnMemoire } from '../../test/infra/entrepots/memoire/entrepotScansEnMemoire.ts';
import { EntrepotScansPostgres } from './entrepots/postgres/entrepotScansPostgres.ts';
import { knexPALA } from '../../../../noyau-partage/src/knex/knexfile.ts';
import { EntrepotUtilisateursPostgres } from './entrepots/postgres/entrepotUtilisateursPostgres.ts';

export type Entrepots = {
  scans: EntrepotScans;
  utilisateurs: EntrepotUtilisateurs;
};

export const fabriqueEntrepots = (): Entrepots => {
  if (adaptateurEnvironnement.baseDeDonnees().active()) {
    return {
      scans: new EntrepotScansPostgres(knexPALA),
      utilisateurs: new EntrepotUtilisateursPostgres(knexPALA),
    };
  }
  return {
    utilisateurs: new EntrepotUtilisateursEnMemoire(),
    scans: new EntrepotScansEnMemoire(),
  };
};
