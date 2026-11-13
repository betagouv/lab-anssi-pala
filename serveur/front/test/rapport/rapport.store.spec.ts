import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { api } from '../../src/http/api.ts';
import type { Scan } from '../../src/rapport/scan.ts';
import {
  etapesDechiffrement,
  type SecretDuLecteur,
} from '../../src/rapport/etapesDechiffrement.ts';

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

const unSecretDuLecteur: SecretDuLecteur = {
  identifiantAppareil: 'appareil-alice',
  secret: new Uint8Array([1, 2, 3]),
};

const unStore = async () => import('../../src/rapport/rapport.store.ts');

describe('Le store de lecture d’un rapport', () => {
  beforeEach(() => {
    api.scans().recupere = async () => unScan;
    etapesDechiffrement.recupereSecretPrf = async () => unSecretDuLecteur;
    etapesDechiffrement.dechiffreRapport = async () => 'contenu en clair';
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

  describe('pendant le déchiffrement', () => {
    it('est en déchiffrement et invite à toucher la YubiKey', async () => {
      const { storeRapport } = await unStore();
      await storeRapport.charge('scan-1');

      void storeRapport.dechiffre();

      expect(get(storeRapport)).toEqual({
        statut: 'dechiffrement',
        message: 'Touchez votre YubiKey lorsqu’elle clignote…',
        scan: unScan,
        contenu: null,
      });
    });
  });

  describe('quand le déchiffrement réussit', () => {
    it('déchiffre le scan avec le secret de la clé qui a répondu', async () => {
      let destinatairesSollicites: unknown;
      let dechiffrementDemande: unknown;
      etapesDechiffrement.recupereSecretPrf = async (destinataires) => {
        destinatairesSollicites = destinataires;
        return unSecretDuLecteur;
      };
      etapesDechiffrement.dechiffreRapport = async (scan, secretDuLecteur) => {
        dechiffrementDemande = { scan, secretDuLecteur };
        return 'contenu en clair';
      };
      const { storeRapport } = await unStore();
      await storeRapport.charge('scan-1');

      await storeRapport.dechiffre();

      expect(destinatairesSollicites).toEqual(unScan.destinataires);
      expect(dechiffrementDemande).toEqual({
        scan: unScan,
        secretDuLecteur: unSecretDuLecteur,
      });
    });

    it('expose le contenu déchiffré', async () => {
      const { storeRapport } = await unStore();
      await storeRapport.charge('scan-1');

      await storeRapport.dechiffre();

      expect(get(storeRapport)).toEqual({
        statut: 'dechiffre',
        message: 'Rapport déchiffré.',
        scan: unScan,
        contenu: 'contenu en clair',
      });
    });
  });

  describe('quand le déchiffrement échoue', () => {
    it('est en erreur avec le message de l’erreur et conserve le scan', async () => {
      etapesDechiffrement.recupereSecretPrf = () =>
        Promise.reject(new Error('Geste annulé.'));
      const { storeRapport } = await unStore();
      await storeRapport.charge('scan-1');

      await storeRapport.dechiffre();

      expect(get(storeRapport)).toEqual({
        statut: 'erreur',
        message: 'Geste annulé.',
        scan: unScan,
        contenu: null,
      });
    });
  });

  describe('quand aucun scan n’est chargé', () => {
    it('ne lance pas le déchiffrement', async () => {
      let cleSollicitee = false;
      etapesDechiffrement.recupereSecretPrf = async () => {
        cleSollicitee = true;
        return unSecretDuLecteur;
      };
      api.scans().recupere = () => Promise.reject(new Error('Scan introuvable.'));
      const { storeRapport } = await unStore();
      await storeRapport.charge('scan-inconnu');

      await storeRapport.dechiffre();

      expect(cleSollicitee).toBe(false);
      expect(get(storeRapport).message).toBe('Scan introuvable.');
    });
  });
});
