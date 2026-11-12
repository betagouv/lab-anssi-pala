import type {
  Environnement,
  ParametresEnrolement,
  ParametresServeur,
} from '../infra/environnement.ts';

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

const serveur = (): ParametresServeur => {
  const port = Number(process.env.PALA_PORT);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(
      `PALA_PORT doit être un numéro de port valide, reçu : ${process.env.PALA_PORT}`
    );
  }
  const hote = process.env.PALA_HOTE;
  if (!hote) {
    throw new Error(
      `la variable d'environnement PALA_HOTE est obligatoire mais absente`
    );
  }
  return { port, hote };
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

const baseDeDonnees = () => {
  return {
    active: () => process.env.BASE_DE_DONNEES_TYPE === 'postgres',
  };
};

export const adaptateurEnvironnement: Environnement = {
  trustProxy,
  enrolement,
  rateLimit,
  serveur,
  verifieLesVariablesNecessaires,
  baseDeDonnees,
};
