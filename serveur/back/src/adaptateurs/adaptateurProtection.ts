import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { type Request, type Response } from 'express';
import { adaptateurEnvironnement } from './adaptateurEnvironnement.ts';

export interface AdaptateurProtection {
  protectionLimiteTrafic: () => RateLimitRequestHandler;
  protectionLimiteTraficEndpointSensible: () => RateLimitRequestHandler;
}

const uneMinute = 60 * 1000;
const parametresCommuns = (typeRequete: string) => ({
  windowMs: uneMinute,
  handler: (requete: Request, reponse: Response) => {
    const attaque = requete.ip!.replaceAll('.', '*');

    if (typeRequete === 'Navigation')
      console.warn(
        `[${typeRequete}] Limite de trafic atteinte par l'IP ${attaque}.`
      );
    else console.error(`[${typeRequete}] Limite de trafic atteinte par une IP.`);
    return reponse.status(429).end();
  },
});

const adaptateurProtection: AdaptateurProtection = {
  protectionLimiteTrafic: () => {
    const routesNonLimitees = ['/statique/', '/favicon.ico'];
    return rateLimit({
      ...parametresCommuns('Navigation'),
      limit: adaptateurEnvironnement.rateLimit().nombreRequetesParMinute,
      skip: (requete) => routesNonLimitees.some((r) => requete.path.startsWith(r)),
    });
  },

  protectionLimiteTraficEndpointSensible: () => {
    return rateLimit({
      ...parametresCommuns('API'),
      limit:
        adaptateurEnvironnement.rateLimit().nombreRequetesParMinuteSurPointSensible,
    });
  },
};

export { adaptateurProtection };
