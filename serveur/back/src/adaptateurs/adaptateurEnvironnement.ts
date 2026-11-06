import type { Environnement, ParametresEnrolement } from '../infra/environnement.ts';

const trustProxy = () => {
  if (process.env.NB_REQUETES_TRUST_PROXY === undefined) {
    throw new Error(
      `la variable d'environnement NB_REQUETES_TRUST_PROXY est obligatoire mais absente`
    );
  }
  const trustProxyEnChaine = process.env.NB_REQUETES_TRUST_PROXY;
  const trustProxyEnNombre = Number(trustProxyEnChaine);
  if (Number.isNaN(trustProxyEnNombre)) {
    console.warn(
      `Attention ! NB_REQUETES_TRUST_PROXY positionné à ${trustProxyEnChaine}`
    );
    return trustProxyEnChaine;
  }
  return trustProxyEnNombre;
};

const enrolement = (): ParametresEnrolement => {
  return {
    nomDuService: process.env.ENROLEMENT_SERVICE ?? 'PALA',
    domaine: process.env.ENROLEMENT_DOMAINE!,
    origine: process.env.ENROLEMENT_ORIGINE!,
    secretDeSession: process.env.ENROLEMENT_SECRET_SESSION!,
  };
};

const rateLimit = () => {
  return {
    nombreRequetesParMinute: process.env.NB_REQUETES_MAX_PAR_MINUTE
      ? parseInt(process.env.NB_REQUETES_MAX_PAR_MINUTE)
      : 0,
    nombreRequetesParMinuteSurPointSensible: process.env
      .NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE
      ? parseInt(process.env.NB_REQUETES_MAX_PAR_MINUTE_ENDPOINT_SENSIBLE)
      : 0,
  };
};

const verifieLesVariablesNecessaires = () => {
  const variablesNecessaires = [
    'ENROLEMENT_DOMAINE',
    'ENROLEMENT_ORIGINE',
    'ENROLEMENT_SECRET_SESSION',
  ];
  const variablesAbsentes: string[] = [];
  variablesNecessaires.forEach((variable) => {
    if (process.env[variable] === undefined) {
      variablesAbsentes.push(variable);
    }
  });
  if (variablesAbsentes.length > 0) {
    const message =
      variablesAbsentes.length > 1
        ? `Les paramètres suivants ${variablesAbsentes.join(', ')} ne sont pas positionnés`
        : `Le paramètre ${variablesAbsentes.join(', ')} n’est pas positionné`;
    throw new Error(message);
  }
};

export const adaptateurEnvironnement: Environnement = {
  trustProxy,
  enrolement,
  rateLimit,
  verifieLesVariablesNecessaires,
};
