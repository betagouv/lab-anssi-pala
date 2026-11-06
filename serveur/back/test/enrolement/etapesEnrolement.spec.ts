import { describe, expect, it, vi } from 'vitest';
import { ContexteEnrolement } from '../../src/enrolement/contexteEnrolement.ts';
import {
  DemarreAuthentification,
  DemarreEnregistrement,
  FinaliseEnregistrement,
  FinaliseEnrolement,
} from '../../src/enrolement/etapesEnrolement.ts';
import { EntrepotUtilisateursEnMemoire } from '../../src/adaptateurs/entrepotUtilisateursEnMemoire.ts';
import type { Enveloppe } from '../../src/enrolement/enveloppe.ts';

describe('Les étapes d‘enrolement', () => {
  describe("Démarre l'authentification (dérivation du secret)", () => {
    const contexteEnregistre = (): ContexteEnrolement => ({
      nom: 'alice',
      identifiantUtilisateur: 'uh-abc',
      appareil: { identifiant: 'appareil-1', clePublique: 'pub-1', compteur: 0 },
    });
    const prepare = () => {
      const prepareAuthentification = vi
        .fn()
        .mockResolvedValue({ options: { pour: 'navigateur' }, defi: 'defi-auth' });
      const demarreAuthentification = new DemarreAuthentification({
        prepareAuthentification,
      });
      return { prepareAuthentification, demarreAuthentification };
    };

    it('renvoie les options et le contexte portant le nouveau défi', async () => {
      const { demarreAuthentification } = prepare();

      const resultat = await demarreAuthentification.demarre({
        contexte: contexteEnregistre(),
      });

      expect(resultat).toEqual({
        options: { pour: 'navigateur' },
        contexte: { ...contexteEnregistre(), defi: 'defi-auth' },
      });
    });

    it("cible l'appareil enregistré", async () => {
      const { prepareAuthentification, demarreAuthentification } = prepare();

      await demarreAuthentification.demarre({ contexte: contexteEnregistre() });

      expect(prepareAuthentification).toHaveBeenCalledWith({
        identifiantAppareil: 'appareil-1',
      });
    });

    it("refuse une authentification avant l'enregistrement", async () => {
      const { demarreAuthentification } = prepare();

      await expect(
        demarreAuthentification.demarre({
          contexte: { nom: 'alice', identifiantUtilisateur: 'uh-abc' },
        })
      ).rejects.toThrow();
    });
  });

  describe("Finalise l'enrôlement (authentification + enveloppe)", () => {
    const uneEnveloppe = (): Enveloppe => ({
      keyId: 'cle-1',
      clePublique: 'cGti',
      clePriveeChiffree: { iv: 'aXY=', ciphertext: 'Y2lwaGVy' },
      prf: { salt: 'c2Vs', hkdfSalt: 'aGtkZg==', version: 1 },
    });

    const contexteAuthentifie = (): ContexteEnrolement => ({
      nom: 'alice',
      identifiantUtilisateur: 'uh-abc',
      appareil: { identifiant: 'appareil-1', clePublique: 'pub-1', compteur: 0 },
      defi: 'defi-auth',
    });

    const prepare = () => {
      const verifieAuthentification = vi.fn().mockResolvedValue({ compteur: 1 });
      const entrepot = new EntrepotUtilisateursEnMemoire();
      const finaliseEnrolement = new FinaliseEnrolement({
        verifieAuthentification,
        entrepot,
      });
      return { verifieAuthentification, entrepot, finaliseEnrolement };
    };

    const demande = () => ({
      reponseAuthentification: { a: 1 },
      enveloppe: uneEnveloppe(),
      contexte: contexteAuthentifie(),
    });

    it("vérifie l'authentification contre le défi et l'appareil du contexte", async () => {
      const { verifieAuthentification, finaliseEnrolement } = prepare();

      await finaliseEnrolement.finalise(demande());

      expect(verifieAuthentification).toHaveBeenCalledWith({
        reponse: { a: 1 },
        defiAttendu: 'defi-auth',
        appareil: { identifiant: 'appareil-1', clePublique: 'pub-1', compteur: 0 },
      });
    });

    it("persiste l'utilisateur enrôlé avec le compteur à jour", async () => {
      const { entrepot, finaliseEnrolement } = prepare();

      const resultat = await finaliseEnrolement.finalise(demande());

      expect(resultat).toEqual({ keyId: 'cle-1' });
      expect(await entrepot.lis('cle-1')).toEqual({
        nom: 'alice',
        appareil: { identifiant: 'appareil-1', clePublique: 'pub-1', compteur: 1 },
        enveloppe: uneEnveloppe(),
      });
    });

    it("refuse la finalisation si l'appareil n'est pas enregistré", async () => {
      const { finaliseEnrolement } = prepare();

      await expect(
        finaliseEnrolement.finalise({
          ...demande(),
          contexte: {
            nom: 'alice',
            identifiantUtilisateur: 'uh-abc',
            defi: 'defi-auth',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe("Finalise l'enregistrement de l'appareil", () => {
    const unAppareil = () => ({
      identifiant: 'appareil-1',
      clePublique: 'pub-1',
      compteur: 0,
    });

    const contexteInitie = (): ContexteEnrolement => ({
      nom: 'alice',
      identifiantUtilisateur: 'uh-abc',
      defi: 'le-defi',
    });

    const prepare = () => {
      const verifieEnregistrement = vi.fn().mockResolvedValue(unAppareil());
      const finaliseEnregistrement = new FinaliseEnregistrement({
        verifieEnregistrement,
      });
      return { verifieEnregistrement, finaliseEnregistrement };
    };

    it('vérifie la réponse contre le défi du contexte', async () => {
      const { verifieEnregistrement, finaliseEnregistrement } = prepare();

      await finaliseEnregistrement.finalise({
        reponse: { r: 1 },
        contexte: contexteInitie(),
      });

      expect(verifieEnregistrement).toHaveBeenCalledWith({
        reponse: { r: 1 },
        defiAttendu: 'le-defi',
      });
    });

    it("renvoie un contexte enrichi de l'appareil", async () => {
      const { finaliseEnregistrement } = prepare();

      const resultat = await finaliseEnregistrement.finalise({
        reponse: { r: 1 },
        contexte: contexteInitie(),
      });

      expect(resultat).toEqual({
        identifiant: 'appareil-1',
        contexte: {
          nom: 'alice',
          identifiantUtilisateur: 'uh-abc',
          appareil: unAppareil(),
        },
      });
    });
  });

  describe("Démarre l'enregistrement de l'appareil", () => {
    const prepare = () => {
      const prepareEnregistrement = vi
        .fn()
        .mockResolvedValue({ options: { pour: 'navigateur' }, defi: 'le-defi' });
      const demarreEnregistrement = new DemarreEnregistrement({
        prepareEnregistrement,
        genereIdentifiantUtilisateur: () => 'uh-abc',
      });
      return { prepareEnregistrement, demarreEnregistrement };
    };

    it('renvoie les options et le contexte de la cérémonie', async () => {
      const { demarreEnregistrement } = prepare();

      const resultat = await demarreEnregistrement.demarre({ nom: 'alice' });

      expect(resultat).toEqual({
        options: { pour: 'navigateur' },
        contexte: {
          nom: 'alice',
          identifiantUtilisateur: 'uh-abc',
          defi: 'le-defi',
        },
      });
    });

    it("transmet l'identifiant utilisateur et le nom à la préparation", async () => {
      const { prepareEnregistrement, demarreEnregistrement } = prepare();

      await demarreEnregistrement.demarre({ nom: 'alice' });

      expect(prepareEnregistrement).toHaveBeenCalledWith({
        identifiantUtilisateur: 'uh-abc',
        nom: 'alice',
      });
    });

    it('refuse un nom vide', async () => {
      const { demarreEnregistrement } = prepare();

      await expect(demarreEnregistrement.demarre({ nom: '  ' })).rejects.toThrow();
    });
  });
});
