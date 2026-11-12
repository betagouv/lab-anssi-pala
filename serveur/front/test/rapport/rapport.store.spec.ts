import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { api } from '../../src/http/api.ts';
import type { Scan } from '../../src/rapport/scan.ts';

const unScan: Scan = {
  id: 'scan-1',
  cible: 'mon-service-securise',
  date: '2026-11-12T10:00:00.000Z',
  rapport: {
    documentId: 'scan-1',
    document: { iv: 'iv', ciphertext: 'contenu-chiffre' },
    enveloppes: [{ keyId: 'cle-alice', enc: 'enc', ciphertext: 'cle' }],
  },
  destinataires: [],
};

const unStore = async () => import('../../src/rapport/rapport.store.ts');

describe('Le store de lecture d’un rapport', () => {
  beforeEach(() => {
    api.scans().recupere = async () => unScan;
  });

  it('est prêt, sans scan ni contenu, tant que rien n’est chargé', async () => {
    const { storeRapport } = await unStore();

    expect(get(storeRapport)).toEqual({
      statut: 'pret',
      message: '',
      scan: null,
      contenu: null,
    });
  });

  describe('pendant le chargement du scan', () => {
    it('est en chargement', async () => {
      const { storeRapport } = await unStore();

      void storeRapport.charge('scan-1');

      expect(get(storeRapport)).toEqual({
        statut: 'chargement',
        message: 'Chargement du scan…',
        scan: null,
        contenu: null,
      });
    });
  });

  describe('quand le scan est chargé', () => {
    it('demande le scan correspondant à l’identifiant', async () => {
      let identifiantDemande = '';
      api.scans().recupere = async (identifiant) => {
        identifiantDemande = identifiant;
        return unScan;
      };
      const { storeRapport } = await unStore();

      await storeRapport.charge('scan-1');

      expect(identifiantDemande).toBe('scan-1');
    });

    it('expose le scan, prêt à être déchiffré', async () => {
      const { storeRapport } = await unStore();

      await storeRapport.charge('scan-1');

      expect(get(storeRapport)).toEqual({
        statut: 'charge',
        message: '',
        scan: unScan,
        contenu: null,
      });
    });
  });

  describe('quand le chargement échoue', () => {
    it('est en erreur avec le message de l’erreur, sans scan', async () => {
      api.scans().recupere = () =>
        Promise.reject(new Error('Aucun rapport pour ce scan.'));
      const { storeRapport } = await unStore();

      await storeRapport.charge('scan-inconnu');

      expect(get(storeRapport)).toEqual({
        statut: 'erreur',
        message: 'Aucun rapport pour ce scan.',
        scan: null,
        contenu: null,
      });
    });
  });
});
