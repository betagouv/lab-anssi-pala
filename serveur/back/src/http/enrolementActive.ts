import type { NextFunction, Request, Response } from 'express';
import { adaptateurEnvironnement } from '../adaptateurs/adaptateurEnvironnement.ts';

export const enrolementActive = (
  _requete: Request,
  reponse: Response,
  suite: NextFunction
) => {
  if (adaptateurEnvironnement.enrolement().active) {
    return suite();
  } else {
    return reponse.status(404).end();
  }
};
