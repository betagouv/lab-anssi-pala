import { ConteneurProxyDockerLocal } from './conteneurProxyDockerLocal.ts';

export const adaptateurProxy = (racine: string) =>
  new ConteneurProxyDockerLocal(racine);
