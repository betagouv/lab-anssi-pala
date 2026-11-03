import { ConteneurProxyDockerLocal } from './conteneurProxyDockerLocal.ts';
import { environnement } from '../../noyau/environnement.ts';
import { proxyEstLocal } from '../domaine/proxyLocal.ts';
import { ConteneurProxyDockeurCC } from './conteneurProxyDockeurCC.ts';

export const adaptateurProxy = (racine: string) => {
  const estProxyLocal = proxyEstLocal(environnement.urlLiteLLMConfiguree());
  if (estProxyLocal) {
    return new ConteneurProxyDockerLocal(racine);
  }
  return new ConteneurProxyDockeurCC();
};
