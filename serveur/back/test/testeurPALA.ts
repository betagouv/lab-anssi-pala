import { creeServeur } from '../src/serveur';
import supertest from 'supertest';
import { adaptateurProtection } from '../src/adaptateurs/adaptateurProtection';
import { LocalisateurServicesEnrolement } from '../src/enrolement/localisateurServicesEnrolement';
import { Express, NextFunction, Request, Response } from 'express';
import { adaptateurEnvironnement } from '../src/adaptateurs/adaptateurEnvironnement';
import { lesServicesDEnrolement } from './servicesDeTest';

const middleware = () => {
  return {
    interdisLaMiseEnCache: (
      _request: Request,
      _reponse: Response,
      suite: NextFunction
    ) => suite(),
    positionneHeaders: (
      _request: Request,
      _reponse: Response,
      suite: NextFunction
    ) => suite(),
    verifieCeremonieEnrolement: (
      _requete: Request,
      _reponse: Response,
      suite: NextFunction
    ) => suite(),
  };
};

export type ServeurPALA = ReturnType<typeof creeServeur>;

export const testeurPALA = () => {
  const localisateurServicesEnrolement = {
    localise: () => lesServicesDEnrolement(),
  } as unknown as LocalisateurServicesEnrolement;
  let serveur: ServeurPALA;
  let app: Express;
  let ceremonieEnCours = false;
  let tentativeCeremonie = 0;
  const lesMiddleware = middleware();

  adaptateurEnvironnement.trustProxy = () => 1;
  adaptateurEnvironnement.rateLimit = () => ({
    nombreRequetesParMinute: 100,
    nombreRequetesParMinuteSurPointSensible: 10,
  });

  const reinitialise = () => {
    if (ceremonieEnCours && tentativeCeremonie < 2) {
      lesMiddleware.verifieCeremonieEnrolement = async (requete, __, suite) => {
        requete.session.enrolement = {
          nom: 'jeanne',
          identifiantUtilisateur: 'identifiant-jeanne',
        };
        suite();
      };
    } else {
      lesMiddleware.verifieCeremonieEnrolement = async (_requete, __, _suite) => {
        tentativeCeremonie = 0;
        throw new Error('Pas de cérémonie d’enrôlement en cours');
      };
    }

    serveur = creeServeur({
      adaptateurProtection: adaptateurProtection,
      middleware: lesMiddleware,
      localisateurServicesEnrolement,
    });
    app = serveur.app;
  };

  const testeur = {
    get: async (url: string) => supertest(app).get(url),
    post: async (url: string, donnees?: Record<string, unknown> | Array<unknown>) =>
      supertest(app).post(url).send(donnees),
    patch: async (url: string, donnees?: Record<string, unknown>) =>
      supertest(app).patch(url).send(donnees),
    put: async (url: string, donnees?: Record<string, unknown>) =>
      supertest(app).put(url).send(donnees),
    delete: async (url: string) => supertest(app).delete(url),
    initialise: () => {
      reinitialise();
      return testeur;
    },
    localisateurServicesEnrolement: () => localisateurServicesEnrolement,
    avecCeremonieEnCours() {
      ceremonieEnCours = true;
      tentativeCeremonie += 1;
      return testeur;
    },
    sansCeremonieEnCours() {
      ceremonieEnCours = false;
      return testeur;
    },
  };
  return testeur;
};
