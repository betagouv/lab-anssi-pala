import { ConteneurProxyDockerLocal } from './conteneurProxyDockerLocal.ts';
import { environnement } from '../../noyau/environnement.ts';
import { proxyEstLocal } from '../domaine/proxyLocal.ts';
import { ConteneurProxyDockeurCC } from './conteneurProxyDockeurCC.ts';
import type { ConteneurProxy } from '../ports/ConteneurProxy.ts';

export const adaptateurProxy = (
  racine: string
): { conteneur: () => ConteneurProxy } => {
  const estProxyLocal = proxyEstLocal(environnement.urlLiteLLMConfiguree());
  if (estProxyLocal) {
    return { conteneur: () => new ConteneurProxyDockerLocal(racine) };
  }
  return { conteneur: () => new ConteneurProxyDockeurCC() };
};
