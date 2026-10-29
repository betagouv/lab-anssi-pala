import type { ConsommationDeTokens } from './consommationDeTokens.ts';
import { estGratuit, TARIFS } from './Tarifs.ts';

export type Cout =
  | { type: 'estimé'; montantEnEuros: number }
  | { type: 'gratuit' }
  | { type: 'tarifInconnu' }
  | { type: 'indisponible' };

export const calculeCout = (releve: ConsommationDeTokens | null): Cout => {
  if (!releve) return { type: 'indisponible' };
  if (estGratuit(releve.fournisseur)) return { type: 'gratuit' };
  const tarif = TARIFS[releve.modele];
  if (!tarif) return { type: 'tarifInconnu' };
  const entreeTotale = releve.entree + releve.cache;
  const montantEnEuros =
    (entreeTotale * tarif.entree) / 1e6 + (releve.sortie * tarif.sortie) / 1e6;
  return { type: 'estimé', montantEnEuros };
};
