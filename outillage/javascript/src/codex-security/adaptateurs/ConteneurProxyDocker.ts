import { join } from 'node:path';
import {
  executeCommande,
  lanceCommande,
} from '../../noyau/adaptateurs/node/processus.ts';
import type { ConfigurationProxy, ConteneurProxy } from '../ports/ConteneurProxy.ts';

const NOM = 'codex-security-litellm';

// Conteneur docker du proxy : environnement codex-security.env, configuration litellm/ montée en
// lecture seule, port publié sur 127.0.0.1 uniquement.
export class ConteneurProxyDocker implements ConteneurProxy {
  readonly #outil: string;

  constructor(outil: string) {
    this.#outil = outil;
  }

  async supprime(): Promise<void> {
    await lanceCommande('docker', ['rm', '-f', NOM], { affichage: 'silencieuse' });
  }

  demarre({ port, image, baseDeDonnees }: ConfigurationProxy): Promise<void> {
    return executeCommande(
      'docker',
      [
        'run',
        '-d',
        '--name',
        NOM,
        '--env-file',
        join(this.#outil, 'codex-security.env'),
        ...(baseDeDonnees ? ['-e', `DATABASE_URL=${baseDeDonnees}`] : []),
        '-v',
        `${join(this.#outil, 'litellm')}:/app/proxy-config:ro`,
        '-p',
        `127.0.0.1:${port}:4000`,
        image,
        '--config',
        '/app/proxy-config/config.yaml',
        '--port',
        '4000',
      ],
      { affichage: 'sansSortieStandard' }
    );
  }
}
