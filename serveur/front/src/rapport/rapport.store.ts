import { writable } from 'svelte/store';
import { api } from '../http/api.ts';
import type { Scan } from './scan.ts';

export type Statut =
  'pret' | 'chargement' | 'charge' | 'dechiffrement' | 'dechiffre' | 'erreur';

export type EtatRapport = {
  statut: Statut;
  message: string;
  scan: Scan | null;
  contenu: string | null;
};

const etatInitial: EtatRapport = {
  statut: 'pret',
  message: '',
  scan: null,
  contenu: null,
};

const { subscribe, set } = writable<EtatRapport>(etatInitial);

const messageDe = (erreur: unknown): string =>
  erreur instanceof Error ? erreur.message : String(erreur);

const charge = async (identifiantScan: string): Promise<void> => {
  set({ ...etatInitial, statut: 'chargement', message: 'Chargement du scan…' });

  try {
    const scan = await api.scans().recupere(identifiantScan);
    set({ ...etatInitial, statut: 'charge', scan });
  } catch (erreur) {
    set({ ...etatInitial, statut: 'erreur', message: messageDe(erreur) });
  }
};

export const storeRapport = { subscribe, charge };
