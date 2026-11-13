import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import type { AuthenticationResponseJSON } from '@simplewebauthn/browser';
import type { IdentiteCryptographique } from 'pala-noyau-partage/src/chiffrement/domaine/identiteCryptographique.ts';
import { encodeEnBase64 } from '../../src/enrolement/enveloppe.ts';
import { api } from '../../src/http/api.ts';
import {
  etapesEnrolement,
  type ResultatEnrolement,
} from '../../src/enrolement/etapesEnrolement.ts';

const identifiantAppareil = new Uint8Array([1, 2, 3]);

const uneIdentiteCryptographique: IdentiteCryptographique = {
  keyId: 'cle-alice',
  clePublique: new Uint8Array([10, 11]),
  clePriveeChiffree: {
    iv: new Uint8Array([20, 21]),
    ciphertext: new Uint8Array([30, 31]),
  },
  prf: {
    salt: new Uint8Array([40, 41]),
    hkdfSalt: new Uint8Array([50, 51]),
    version: 1,
  },
};

const uneReponseAuthentification = {
  id: 'identifiant-appareil',
} as AuthenticationResponseJSON;

const unResultatEnrolement: ResultatEnrolement = {
  identite: uneIdentiteCryptographique,
  reponseAuthentification: uneReponseAuthentification,
};

const unStore = async () => import('../../src/enrolement/enrolement.store.ts');

describe('Le store d’enrôlement', () => {
  beforeEach(() => {
    etapesEnrolement.recupereSecretAuthentification = async () => ({
      secret: new Uint8Array([60, 61]),
      reponseAuthentification: uneReponseAuthentification,
    });
    etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
    etapesEnrolement.genereIdentiteCryptographique = async () =>
      unResultatEnrolement;
    api.enrolement().finaliseEnrolement = async () => ({});
  });

  it('est prêt, sans message ni enveloppe, tant que rien n’est lancé', async () => {
    const { storeEnrolement } = await unStore();

    expect(get(storeEnrolement)).toEqual({
      statut: 'pret',
      message: '',
      enveloppe: null,
    });
  });

  describe('pendant l’enrôlement', () => {
    it('est en cours et invite à toucher la YubiKey', async () => {
      etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
      const { storeEnrolement } = await unStore();

      void storeEnrolement.enrole('Alice');

      expect(get(storeEnrolement)).toEqual({
        statut: 'en-cours',
        message: 'Touchez votre YubiKey lorsqu’elle clignote…',
        enveloppe: null,
      });
    });

    it('ignore une seconde demande d’enrôlement', async () => {
      let enregistrementAppareilAppele = false;
      etapesEnrolement.enregistreAppareil = async () => {
        enregistrementAppareilAppele = true;
        return identifiantAppareil;
      };
      const { storeEnrolement } = await unStore();
      void storeEnrolement.enrole('Alice');

      await storeEnrolement.enrole('Alice');

      expect(enregistrementAppareilAppele).toBe(true);
    });
  });

  describe('quand l’enrôlement réussit', () => {
    it('enregistre l’appareil au nom de l’utilisateur', async () => {
      let appareilPour: string = '';
      etapesEnrolement.enregistreAppareil = async (nom: string) => {
        appareilPour = nom;
        return identifiantAppareil;
      };
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(appareilPour).toBe('Alice');
    });

    it('génère l’identité cryptographique pour l’appareil enregistré', async () => {
      let identifiantAppareilEnregistre: Uint8Array | undefined;
      etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
      etapesEnrolement.genereIdentiteCryptographique = async (
        identifiantAppareil
      ) => {
        identifiantAppareilEnregistre = identifiantAppareil;
        return unResultatEnrolement;
      };
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(identifiantAppareilEnregistre).toBe(identifiantAppareil);
    });

    it('finalise avec la réponse d’authentification et l’enveloppe en base64', async () => {
      etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
      etapesEnrolement.genereIdentiteCryptographique = async () =>
        unResultatEnrolement;
      let finalisationAppelee = false;
      api.enrolement().finaliseEnrolement = async () => {
        finalisationAppelee = true;
        return undefined;
      };
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(finalisationAppelee).toBe(true);
    });

    it('est ok, annonce le keyId et expose l’enveloppe', async () => {
      etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
      etapesEnrolement.genereIdentiteCryptographique = async () =>
        unResultatEnrolement;
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(get(storeEnrolement)).toEqual({
        statut: 'ok',
        message: 'Identité enrôlée (keyId cle-alice).',
        enveloppe: encodeEnBase64(uneIdentiteCryptographique),
      });
    });
  });

  describe('quand l’enrôlement échoue', () => {
    it('est en erreur avec le message de l’erreur, sans enveloppe', async () => {
      etapesEnrolement.genereIdentiteCryptographique = async () =>
        unResultatEnrolement;
      api.enrolement().finaliseEnrolement = () =>
        Promise.reject(new Error('Authentification refusée.'));
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(get(storeEnrolement)).toEqual({
        statut: 'erreur',
        message: 'Authentification refusée.',
        enveloppe: null,
      });
    });

    it('affiche telle quelle une valeur rejetée qui n’est pas une erreur', async () => {
      etapesEnrolement.enregistreAppareil = () => Promise.reject('geste annulé');
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(get(storeEnrolement).message).toBe('geste annulé');
    });

    it('ne finalise pas si l’enregistrement de l’appareil échoue', async () => {
      let finaliseEnrolementAppele = false;
      let genereIdentiteCryptographiqueAppele = false;
      api.enrolement().finaliseEnrolement = async () => {
        finaliseEnrolementAppele = true;
        return {};
      };
      etapesEnrolement.genereIdentiteCryptographique = async () => {
        genereIdentiteCryptographiqueAppele = true;
        return unResultatEnrolement;
      };
      etapesEnrolement.enregistreAppareil = () => Promise.reject(new Error('refus'));
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole('Alice');

      expect(genereIdentiteCryptographiqueAppele).toBe(false);
      expect(finaliseEnrolementAppele).toBe(false);
    });

    it('permet de relancer un enrôlement', async () => {
      etapesEnrolement.enregistreAppareil = () => Promise.reject(new Error('refus'));
      const { storeEnrolement } = await unStore();
      await storeEnrolement.enrole('Alice');

      etapesEnrolement.enregistreAppareil = async () => identifiantAppareil;
      etapesEnrolement.genereIdentiteCryptographique = async () =>
        unResultatEnrolement;
      api.enrolement().finaliseEnrolement = async () => ({});
      await storeEnrolement.enrole('Alice');

      expect(get(storeEnrolement).statut).toBe('ok');
    });
  });

  describe('quand le nom est vide', () => {
    it.each(['', '   '])('reste prêt sans rien lancer (« %s »)', async (nom) => {
      let enregistreAppareilAppele = false;
      etapesEnrolement.enregistreAppareil = async () => {
        enregistreAppareilAppele = true;
        return identifiantAppareil;
      };
      const { storeEnrolement } = await unStore();

      await storeEnrolement.enrole(nom);

      expect(get(storeEnrolement).statut).toBe('pret');
      expect(enregistreAppareilAppele).toBe(false);
    });
  });
});
