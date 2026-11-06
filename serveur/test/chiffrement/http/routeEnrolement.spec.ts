import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import session from 'express-session';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import {
  creeRouteEnrolement,
  type ServicesEnrolement,
} from '../../../back/src/http/routeEnrolement.ts';

const CONTEXTE = {
  nom: 'alice',
  identifiantUtilisateur: 'uh-abc',
  defi: 'defi-1',
};

type Appels = Record<string, unknown>;

const fabriqueServices = (appels: Appels, enErreur?: string): ServicesEnrolement => {
  const peutRepondre =
    (cle: string, valeur: unknown) => async (demande: unknown) => {
      appels[cle] = demande;
      if (enErreur === cle) throw new Error('refusé par le service');
      return valeur;
    };
  return {
    demarreEnregistrement: {
      demarre: peutRepondre('demarreEnregistrement', {
        options: { pour: 'navigateur' },
        contexte: CONTEXTE,
      }),
    },
    finaliseEnregistrement: {
      finalise: peutRepondre('finaliseEnregistrement', {
        identifiant: 'appareil-1',
        contexte: CONTEXTE,
      }),
    },
    demarreAuthentification: {
      demarre: peutRepondre('demarreAuthentification', {
        options: { pour: 'navigateur' },
        contexte: CONTEXTE,
      }),
    },
    finaliseEnrolement: {
      finalise: peutRepondre('finaliseEnrolement', { keyId: 'cle-1' }),
    },
  } as ServicesEnrolement;
};

let serveur: Server | undefined;

const demarreServeur = (services: ServicesEnrolement): string => {
  const app = express();
  app.use(
    '/enrolement',
    session({
      name: 'pala.enrolement',
      secret: 'secret-de-test',
      resave: false,
      saveUninitialized: false,
    }),
    express.json(),
    creeRouteEnrolement(services)
  );
  serveur = app.listen(0);
  const { port } = serveur.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
};

const poste = (url: string, corps: unknown, cookie?: string) =>
  fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(corps),
  });

const cookieDe = (reponse: Response): string =>
  reponse.headers
    .getSetCookie()
    .map((entree) => entree.split(';')[0])
    .join('; ');

const ouvreCeremonie = async (url: string): Promise<string> => {
  const reponse = await poste(`${url}/enrolement/enregistrement/demarrage`, {
    nom: 'alice',
  });
  return cookieDe(reponse);
};

afterEach(() => serveur?.close());

describe("Routes d'enrôlement", () => {
  describe('POST /enrolement/enregistrement/demarrage', () => {
    it("initie l'enregistrement, ne renvoie que les options et ouvre une session", async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels));

      const reponse = await poste(`${url}/enrolement/enregistrement/demarrage`, {
        nom: 'alice',
      });

      expect(reponse.status).toBe(200);
      expect(await reponse.json()).toEqual({ options: { pour: 'navigateur' } });
      expect(appels.demarreEnregistrement).toEqual({ nom: 'alice' });
      expect(cookieDe(reponse)).toContain('pala.enrolement=');
    });

    it('répond 400 si une erreur est levée', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels, 'demarreEnregistrement'));

      const reponse = await poste(`${url}/enrolement/enregistrement/demarrage`, {
        nom: 'alice',
      });

      expect(reponse.status).toBe(400);
      expect(await reponse.json()).toEqual({ erreur: 'refusé par le service' });
    });
  });

  describe('POST /enrolement/enregistrement/finalisation', () => {
    it('ré-injecte le contexte de session et retourne 201', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels));
      const cookie = await ouvreCeremonie(url);

      const reponse = await poste(
        `${url}/enrolement/enregistrement/finalisation`,
        { reponse: { preuve: 1 } },
        cookie
      );

      expect(reponse.status).toBe(201);
      expect(await reponse.json()).toEqual({ identifiant: 'appareil-1' });
      expect(appels.finaliseEnregistrement).toEqual({
        reponse: { preuve: 1 },
        contexte: CONTEXTE,
      });
    });

    it('répond 400 sans cérémonie en cours', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels));

      const reponse = await poste(`${url}/enrolement/enregistrement/finalisation`, {
        reponse: { preuve: 1 },
      });

      expect(reponse.status).toBe(400);
      expect(appels.finaliseEnregistrement).toBeUndefined();
    });
  });

  describe('POST /enrolement/authentification/demarrage', () => {
    it('démarre l’authentification à partir du contexte de session', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels));
      const cookie = await ouvreCeremonie(url);

      const reponse = await poste(
        `${url}/enrolement/authentification/demarrage`,
        {},
        cookie
      );

      expect(reponse.status).toBe(200);
      expect(await reponse.json()).toEqual({ options: { pour: 'navigateur' } });
      expect(appels.demarreAuthentification).toEqual({ contexte: CONTEXTE });
    });
  });

  describe('POST /enrolement/finalisation', () => {
    it('finalise l’enrôlement puis consomme la session', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels));
      const cookie = await ouvreCeremonie(url);

      const reponse = await poste(
        `${url}/enrolement/finalisation`,
        {
          reponseAuthentification: { preuve: 2 },
          enveloppe: { keyId: 'cle-1' },
        },
        cookie
      );

      expect(reponse.status).toBe(201);
      expect(await reponse.json()).toEqual({ keyId: 'cle-1' });
      expect(appels.finaliseEnrolement).toEqual({
        reponseAuthentification: { preuve: 2 },
        enveloppe: { keyId: 'cle-1' },
        contexte: CONTEXTE,
      });

      // La session est consommée : rejouer la finalisation échoue en 400.
      const rejoue = await poste(
        `${url}/enrolement/finalisation`,
        {
          reponseAuthentification: { preuve: 2 },
          enveloppe: { keyId: 'cle-1' },
        },
        cookie
      );
      expect(rejoue.status).toBe(400);
    });

    it('répond 400 si une erreur est levée', async () => {
      const appels: Appels = {};
      const url = demarreServeur(fabriqueServices(appels, 'finaliseEnrolement'));
      const cookie = await ouvreCeremonie(url);

      const reponse = await poste(
        `${url}/enrolement/finalisation`,
        { reponseAuthentification: { preuve: 2 }, enveloppe: { keyId: 'cle-1' } },
        cookie
      );

      expect(reponse.status).toBe(400);
      expect(await reponse.json()).toEqual({ erreur: 'refusé par le service' });
    });
  });
});
