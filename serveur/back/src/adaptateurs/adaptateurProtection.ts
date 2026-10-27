import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';
import { type Request, type Response } from 'express';

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
    const maxParFenetreParIp = process.env.NB_REQUETES_MAX_PAR_MINUTE
      ? parseInt(process.env.NB_REQUETES_MAX_PAR_MINUTE)
      : 0;
    const routesNonLimitees = ['/statique/', '/favicon.ico'];

    return rateLimit({
      ...parametresCommuns('Navigation'),
      limit: maxParFenetreParIp,
      skip: (requete) => routesNonLimitees.some((r) => requete.path.startsWith(r)),
    });
  },

  protectionLimiteTraficEndpointSensible: () => {
    const maxParFenetreParIp = process.env
      .NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE
      ? parseInt(process.env.NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE)
      : 0;

    return rateLimit({
      ...parametresCommuns('API'),
      limit: maxParFenetreParIp,
    });
  },
};

export { adaptateurProtection };
