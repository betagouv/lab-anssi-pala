import { join } from 'node:path';
import {
  executeCommande,
  lanceCommande,
} from '../../noyau/infrastructure/processus.ts';
import type { ConfigurationProxy, ConteneurProxy } from '../ports/ConteneurProxy.ts';

const NOM = 'codex-security-litellm';

export class ConteneurProxyDocker implements ConteneurProxy {
  readonly #outil: string;

  constructor(outil: string) {
    this.#outil = outil;
  }

  async supprime(): Promise<void> {
    await lanceCommande('docker', ['rm', '-f', NOM], { affichage: 'silencieuse' });
  }

  demarre({ url, image, baseDeDonnees }: ConfigurationProxy): Promise<void> {
    const { hostname, port } = new URL(url);
    const portExpose = port || '4000';
    return executeCommande(
      'docker',
      [
        'run',
        '-d',
        '--name',
        NOM,
        '-e',
        'FOURNISSEUR_BASE_URL',
        '-e',
        'FOURNISSEUR_API_KEY',
        ...(baseDeDonnees ? ['-e', `DATABASE_URL=${baseDeDonnees}`] : []),
        '-v',
        `${join(this.#outil, 'litellm')}:/app/proxy-config:ro`,
        '-p',
        `${hostname}:${portExpose}:${portExpose}`,
        image,
        '--config',
        '/app/proxy-config/config.yaml',
        '--port',
        portExpose,
      ],
      { affichage: 'sansSortieStandard' }
    );
  }
}
