import {
  Router,
  type ErrorRequestHandler,
  type Request,
  type Response,
} from 'express';
import type { ContexteEnrolement } from '../enrolement/contexteEnrolement.ts';
import {
  DemarreAuthentification,
  DemarreEnregistrement,
  FinaliseEnregistrement,
  FinaliseEnrolement,
} from '../enrolement/etapesEnrolement.ts';

declare module 'express-session' {
  interface SessionData {
    enrolement?: ContexteEnrolement;
  }
}

export type ServicesEnrolement = {
  demarreEnregistrement: Pick<DemarreEnregistrement, 'demarre'>;
  finaliseEnregistrement: Pick<FinaliseEnregistrement, 'finalise'>;
  demarreAuthentification: Pick<DemarreAuthentification, 'demarre'>;
  finaliseEnrolement: Pick<FinaliseEnrolement, 'finalise'>;
};

const intercepteErreurs: ErrorRequestHandler = (
  erreur,
  _requete,
  reponse,
  _suite
) => {
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  reponse.status(400).json({ erreur: message });
};

const exigeContexte = (requete: Request): ContexteEnrolement => {
  const contexte = requete.session.enrolement;
  if (!contexte) {
    throw new Error("Aucune cérémonie d'enrôlement en cours.");
  }
  return contexte;
};

export const creeRouteEnrolement = (services: ServicesEnrolement): Router => {
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

  routeur.post(
    '/enregistrement/finalisation',
    async (requete: Request, reponse: Response) => {
      const { identifiant, contexte } = await finaliseEnregistrement.finalise({
        reponse: requete.body?.reponse,
        contexte: exigeContexte(requete),
      });
      requete.session.enrolement = contexte;
      reponse.status(201).json({ identifiant });
    }
  );

  routeur.post(
    '/authentification/demarrage',
    async (requete: Request, reponse: Response) => {
      const { options, contexte } = await demarreAuthentification.demarre({
        contexte: exigeContexte(requete),
      });
      requete.session.enrolement = contexte;
      reponse.json({ options });
    }
  );

  routeur.post('/finalisation', async (requete: Request, reponse: Response) => {
    const resultat = await finaliseEnrolement.finalise({
      reponseAuthentification: requete.body?.reponseAuthentification,
      enveloppe: requete.body?.enveloppe,
      contexte: exigeContexte(requete),
    });
    delete requete.session.enrolement;
    reponse.status(201).json(resultat);
  });

  routeur.use(intercepteErreurs);

  return routeur;
};
