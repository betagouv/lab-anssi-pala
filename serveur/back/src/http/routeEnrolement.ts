import {
  type ErrorRequestHandler,
  type Request,
  type Response,
  Router,
} from 'express';
import type { ContexteEnrolement } from '../enrolement/contexteEnrolement.ts';
import type { ServicesEnrolement } from '../enrolement/localisateurServicesEnrolement.ts';
import type { Middleware } from './middleware.ts';

declare module 'express-session' {
  interface SessionData {
    enrolement?: ContexteEnrolement;
  }
}

const intercepteErreurs: ErrorRequestHandler = (
  erreur,
  _requete,
  reponse,
  _suite
) => {
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  reponse.status(400).json({ erreur: message });
};

const recupereContexte = (requete: Request): ContexteEnrolement => {
  return requete.session.enrolement as ContexteEnrolement;
};

export const creeRouteEnrolement = (
  services: ServicesEnrolement,
  middlewares: Middleware
): Router => {
  const routeur = Router();
  const {
    demarreEnregistrement,
    finaliseEnregistrement,
    demarreAuthentification,
    finaliseEnrolement,
  } = services;

  routeur.post(
    '/enregistrement/demarrage',
    async (requete: Request, reponse: Response) => {
      const { options, contexte } = await demarreEnregistrement.demarre({
        nom: requete.body?.nom,
      });
      requete.session.enrolement = contexte;
      reponse.json({ options });
    }
  );

  const creeRouteEnrolementPourCeremonieEnCours = () => {
    const routeur = Router();
    routeur.post(
      '/enregistrement/finalisation',
      middlewares.verifieCeremonieEnrolement,
      async (requete: Request, reponse: Response) => {
        const { identifiant, contexte } = await finaliseEnregistrement.finalise({
          reponse: requete.body?.reponse,
          contexte: recupereContexte(requete),
        });
        requete.session.enrolement = contexte;
        reponse.status(201).json({ identifiant });
      }
    );

    routeur.post(
      '/authentification/demarrage',
      middlewares.verifieCeremonieEnrolement,
      async (requete: Request, reponse: Response) => {
        const { options, contexte } = await demarreAuthentification.demarre({
          contexte: recupereContexte(requete),
        });
        requete.session.enrolement = contexte;
        reponse.json({ options });
      }
    );

    routeur.post(
      '/finalisation',
      middlewares.verifieCeremonieEnrolement,
      async (requete: Request, reponse: Response) => {
        const resultat = await finaliseEnrolement.finalise({
          reponseAuthentification: requete.body?.reponseAuthentification,
          enveloppe: requete.body?.enveloppe,
          contexte: recupereContexte(requete),
        });
        delete requete.session.enrolement;
        reponse.status(201).json(resultat);
      }
    );
    return routeur;
  };

  routeur.use(creeRouteEnrolementPourCeremonieEnCours());

  routeur.use(intercepteErreurs);

  return routeur;
};
