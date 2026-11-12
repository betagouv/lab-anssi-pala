import type { Entrepot } from '../../../../noyau-partage/src/entrepots/entrepots.ts';
import type { Utilisateur } from './utilisateur.ts';

export interface EntrepotUtilisateurs extends Entrepot<Utilisateur> {
  parKeyIds: (keyIds: string[]) => Promise<Utilisateur[]>;
}
