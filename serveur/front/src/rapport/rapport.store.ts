import { get, writable } from 'svelte/store';
import { api } from '../http/api.ts';
import { etapesDechiffrement } from './etapesDechiffrement.ts';
import type { Scan } from './scan.ts';
import { marked } from 'marked';

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

const store = writable<EtatRapport>(etatInitial);
const { subscribe, set } = store;

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

const dechiffre = async (): Promise<void> => {
  const { scan } = get(store);
  if (!scan) return;

  set({
    statut: 'dechiffrement',
    message: 'Touchez votre YubiKey lorsqu’elle clignote…',
    scan,
    contenu: null,
  });

  try {
    const secretDuLecteur = await etapesDechiffrement.recupereSecretPrf(
      scan.destinataires
    );
    const contenu = await etapesDechiffrement.dechiffreRapport(
      scan,
      secretDuLecteur
    );
    const contenuMarkdown = await marked.parse(contenu);
    set({
      statut: 'dechiffre',
      message: 'Rapport déchiffré.',
      scan,
      contenu: contenuMarkdown,
    });
  } catch (erreur) {
    set({ statut: 'erreur', message: messageDe(erreur), scan, contenu: null });
  }
};

export const storeRapport = { subscribe, charge, dechiffre };
