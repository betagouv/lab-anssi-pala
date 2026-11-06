import { beforeEach, describe, expect, it } from 'vitest';
import { testeurPALA } from '../testeurPALA.ts';
import { adaptateurEnvironnement } from '../../src/adaptateurs/adaptateurEnvironnement';
import { lesServicesDEnrolement } from '../servicesDeTest';

describe("Routes d'enrôlement", () => {
  const testeur = testeurPALA();

  beforeEach(() => {
    adaptateurEnvironnement.verifieLesVariablesNecessaires = () => {};
    adaptateurEnvironnement.enrolement = () => ({
      domaine: 'htpp://127.0.01',
      nomDuService: 'PALA-Test',
      origine: 'http://127.0.0.1',
      secretDeSession: 'un-secret',
    });
    testeur.initialise();
  });

  it.each([
    {
      etape: 'finalisation enregistrement',
      route: '/enrolement/enregistrement/finalisation',
      corps: {
        reponse: { preuve: 1 },
      },
    },
    {
      etape: 'démarrage authentification',
      route: '/enrolement/authentification/demarrage',
      corps: {},
    },
    {
      etape: 'finalisation enrôlement',
      route: `/enrolement/finalisation`,
      corps: {
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
      },
    },
  ])(
    `L’étape $etape nécessite une cérémonie en cours`,
    async ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      etape,
      route,
      corps,
    }: {
      etape: string;
      route: string;
      corps: Record<string, unknown>;
    }) => {
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement();
      testeur.sansCeremonieEnCours().initialise();

      const reponse = await testeur.post(route, corps);

      expect(reponse.status).toBe(400);
    }
  );

  describe('POST /enrolement/enregistrement/demarrage', () => {
    it("initie l'enregistrement, ne renvoie que les options et ouvre une session", async () => {
      let enregistrementDemarrePour = '';
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          demarreEnregistrement: {
            demarre: async (demande) => {
              enregistrementDemarrePour = demande.nom;
              return {
                options: { pour: 'navigateur' },
                contexte: {
                  nom: 'jeanne',
                  identifiantUtilisateur: 'identifiant-jeanne',
                },
              };
            },
          },
        });
      testeur.initialise();

      const reponse = await testeur.post(`/enrolement/enregistrement/demarrage`, {
        nom: 'jeanne',
      });

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({ options: { pour: 'navigateur' } });
      expect(enregistrementDemarrePour).toBe('jeanne');
      expect(reponse.headers['set-cookie'][0]).toContain('pala.enrolement=');
    });

    it('répond 400 si une erreur est levée', async () => {
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          demarreEnregistrement: {
            demarre: async () => {
              throw new Error('refusé par le service');
            },
          },
        });
      testeur.initialise();

      const reponse = await testeur.post(`/enrolement/enregistrement/demarrage`, {
        nom: 'jeanne',
      });

      expect(reponse.status).toBe(400);
      expect(reponse.body).toEqual({ erreur: 'refusé par le service' });
    });
  });

  describe('POST /enrolement/enregistrement/finalisation', () => {
    it('ré-injecte le contexte de session et retourne 201', async () => {
      let enregistrementFinaliseAvec = undefined;
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          finaliseEnregistrement: {
            finalise: async (demande) => {
              enregistrementFinaliseAvec = demande;
              return {
                identifiant: 'appareil-1',
                contexte: {
                  nom: 'jeanne',
                  identifiantUtilisateur: 'identifiant-jeanne',
                },
              };
            },
          },
        });
      testeur.avecCeremonieEnCours().initialise();

      const reponse = await testeur.post(`/enrolement/enregistrement/finalisation`, {
        reponse: { preuve: 1 },
      });

      expect(reponse.status).toBe(201);
      expect(reponse.body).toEqual({ identifiant: 'appareil-1' });
      expect(enregistrementFinaliseAvec).toEqual({
        reponse: { preuve: 1 },
        contexte: {
          identifiantUtilisateur: 'identifiant-jeanne',
          nom: 'jeanne',
        },
      });
    });
  });

  describe('POST /enrolement/authentification/demarrage', () => {
    const testeur = testeurPALA();

    it('démarre l’authentification à partir du contexte de session', async () => {
      let authentificationDemarreePour = undefined;
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          demarreAuthentification: {
            demarre: async (demande) => {
              authentificationDemarreePour = demande.contexte;
              return {
                options: { pour: 'navigateur' },
                contexte: demande.contexte,
              };
            },
          },
        });
      testeur.avecCeremonieEnCours().initialise();

      const reponse = await testeur.post(
        `/enrolement/authentification/demarrage`,
        {}
      );

      expect(reponse.status).toBe(200);
      expect(reponse.body).toEqual({ options: { pour: 'navigateur' } });
      expect(authentificationDemarreePour).toEqual({
        identifiantUtilisateur: 'identifiant-jeanne',
        nom: 'jeanne',
      });
    });
  });

  describe('POST /enrolement/finalisation', () => {
    const testeur = testeurPALA();
    it('finalise l’enrôlement', async () => {
      let enrolementFinalisePour = undefined;
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          finaliseEnrolement: {
            finalise: async (demande) => {
              enrolementFinalisePour = demande;
              return {
                keyId: 'cle-1',
              };
            },
          },
        });
      testeur.avecCeremonieEnCours().initialise();

      const reponse = await testeur.post(`/enrolement/finalisation`, {
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
      });

      expect(reponse.status).toBe(201);
      expect(reponse.body).toEqual({ keyId: 'cle-1' });
      expect(enrolementFinalisePour).toEqual({
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
        contexte: {
          identifiantUtilisateur: 'identifiant-jeanne',
          nom: 'jeanne',
        },
      });
    });

    it('finalise l’enrôlement et supprime la session', async () => {
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          finaliseEnrolement: {
            finalise: async () => {
              return {
                keyId: 'cle-1',
              };
            },
          },
        });
      testeur.avecCeremonieEnCours().initialise();

      await testeur.post(`/enrolement/finalisation`, {
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
      });
      const reponse = await testeur.post(`/enrolement/finalisation`, {
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
      });

      expect(reponse.status).toBe(400);
    });

    it('répond 400 si une erreur est levée', async () => {
      testeur.localisateurServicesEnrolement().localise = () =>
        lesServicesDEnrolement({
          finaliseEnrolement: {
            finalise: async () => {
              throw new Error('refusé par le service');
            },
          },
        });
      testeur.avecCeremonieEnCours().initialise();

      const reponse = await testeur.post(`/enrolement/finalisation`, {
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
      });

      expect(reponse.status).toBe(400);
      expect(reponse.body).toEqual({ erreur: 'refusé par le service' });
    });
  });
});
