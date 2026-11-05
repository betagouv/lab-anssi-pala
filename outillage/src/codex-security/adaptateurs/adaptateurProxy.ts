import { ConteneurProxyDockerLocal } from './conteneurProxyDockerLocal.ts';
import { environnement } from '../../noyau/environnement.ts';
import { proxyEstLocal } from '../domaine/proxyLocal.ts';
import { ConteneurProxyDockeurCC } from './conteneurProxyDockeurCC.ts';
import type { ConteneurProxy } from '../ports/ConteneurProxy.ts';
import { SystemeDeFichierNode } from '../../noyau/infrastructure/SystemeDeFichierNode.ts';
import { SystemeDeFichierCellar } from '../../noyau/infrastructure/systemeDeFichierCellar.ts';
import type { SystemeDeFichier } from '../../noyau/ports/SystemeDeFichier.ts';

export const adaptateurProxy = (
  racine: string
): { conteneur: () => ConteneurProxy; systemeDeFichier: () => SystemeDeFichier } => {
  const estProxyLocal = proxyEstLocal(environnement.urlLiteLLMConfiguree());
  if (estProxyLocal) {
    return {
      conteneur: () => new ConteneurProxyDockerLocal(racine),
      systemeDeFichier: () => new SystemeDeFichierNode(racine),
    };
  }
  return {
    conteneur: () => new ConteneurProxyDockeurCC(),
    systemeDeFichier: () => new SystemeDeFichierCellar(),
  };
};
