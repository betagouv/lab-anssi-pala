import type { Environnement } from '../infra/environnement.ts';

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

export const adaptateurEnvironnement: Environnement = {
  trustProxy,
};
